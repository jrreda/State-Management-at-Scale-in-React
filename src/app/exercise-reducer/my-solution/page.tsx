"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { createContext, ReactNode, use, useReducer, useState } from "react";
import { FlightOption, getFlightOptions } from "@/app/exerciseUtils";

type BookingState = {
  status: "idle" | "searching" | "results" | "error";
  flightOptions: FlightOption[] | null;
  searchParams: {
    destination: string;
    departure: string;
    arrival: string;
    passengers: number;
    isOneWay: boolean;
  } | null;
  selectedFlightId: string | null;
};

const initialBookingState: BookingState = {
  status: "idle",
  flightOptions: null,
  searchParams: null,
  selectedFlightId: null,
};

type BookingAction =
  | {
      type: "submit";
      payload: {
        destination: string;
        departure: string;
        arrival: string;
        passengers: number;
        isOneWay: boolean;
      };
    }
  | {
      type: "results";
      flightOptions: FlightOption[];
    }
  | {
      type: "back";
    }
  | {
      type: "error";
    }
  | {
      type: "selectFlight";
      flightId: string;
    };

function bookingReducer(
  state: BookingState,
  action: BookingAction,
): BookingState {
  switch (action.type) {
    case "submit":
      return {
        ...state,
        status: "searching",
        searchParams: action.payload,
        selectedFlightId: null,
      };

    case "results":
      return {
        ...state,
        status: "results",
        flightOptions: action.flightOptions,
      };

    case "selectFlight":
      return {
        ...state,
        selectedFlightId: action.flightId,
      };

    case "back":
      if (state.status === "results") {
        return {
          ...state,
          status: "idle",
          flightOptions: null,
          selectedFlightId: null,
        };
      }
      return state;

    case "error":
      return {
        ...state,
        status: "error",
      };

    default:
      return state;
  }
}

interface SearchResultsProps {
  onBack: () => void;
}

function SearchResults({ onBack }: SearchResultsProps) {
  const { state, dispatch } = useBooking();
  const flightOptions = state.flightOptions ?? [];
  const passengers = state.searchParams?.passengers ?? 1;

  const selectedFlight =
    flightOptions.find((flight) => flight.id === state.selectedFlightId) ??
    null;
  const totalPrice = selectedFlight ? selectedFlight.price * passengers : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-2xl">Search Results</h2>
        <Button variant="outline" onClick={onBack}>
          Back to Search
        </Button>
      </div>

      <div className="space-y-4">
        {flightOptions.map((flight) => (
          <div
            key={flight.id}
            className={`p-4 border rounded hover:shadow-md ${
              selectedFlight?.id === flight.id
                ? "border-blue-500 bg-blue-50"
                : ""
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">{flight.airline}</h3>
                <p className="text-gray-600">Duration: {flight.duration}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-xl">${flight.price}</p>
                <Button
                  className="bg-green-500 hover:bg-green-600 mt-2 px-4 py-1 rounded text-white"
                  onClick={() =>
                    dispatch({ type: "selectFlight", flightId: flight.id })
                  }
                >
                  {selectedFlight?.id === flight.id ? "Selected" : "Select"}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedFlight && (
        <div className="bg-gray-50 mt-8 p-4 rounded-lg">
          <h3 className="mb-2 font-semibold text-lg">Booking Summary</h3>
          <div className="space-y-2">
            <p>Flight: {selectedFlight.airline}</p>
            <p>Duration: {selectedFlight.duration}</p>
            <p>Passengers: {passengers}</p>
            <p className="mt-4 font-bold text-xl">Total: ${totalPrice}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function BookingForm({
  onSubmit,
}: {
  onSubmit: (formData: {
    destination: string;
    departure: string;
    arrival: string;
    passengers: number;
    isOneWay: boolean;
  }) => Promise<void>;
}) {
  const { state } = useBooking();
  const isSubmitting = state.status === "searching";

  const [flight, setFlight] = useState({
    destination: state.searchParams?.destination ?? "",
    departure: state.searchParams?.departure ?? "",
    arrival: state.searchParams?.arrival ?? "",
    passengers: state.searchParams?.passengers ?? 1,
    isOneWay: state.searchParams?.isOneWay ?? false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(flight);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Switch
          id="one-way"
          checked={flight.isOneWay}
          onCheckedChange={(checked) =>
            setFlight((prev) => ({ ...prev, isOneWay: checked }))
          }
        />
        <Label htmlFor="one-way">One-way flight</Label>
      </div>

      <div>
        <Label htmlFor="destination" className="block mb-1">
          Destination
        </Label>
        <Input
          type="text"
          id="destination"
          value={flight.destination}
          onChange={(e) =>
            setFlight((prev) => ({ ...prev, destination: e.target.value }))
          }
          required
        />
      </div>

      <div>
        <Label htmlFor="departure" className="block mb-1">
          Departure Date
        </Label>
        <Input
          type="date"
          id="departure"
          value={flight.departure}
          onChange={(e) =>
            setFlight((prev) => ({ ...prev, departure: e.target.value }))
          }
          required
        />
      </div>

      {!flight.isOneWay && (
        <div>
          <Label htmlFor="arrival" className="block mb-1">
            Return Date
          </Label>
          <Input
            type="date"
            id="arrival"
            value={flight.arrival}
            onChange={(e) =>
              setFlight((prev) => ({ ...prev, arrival: e.target.value }))
            }
            required
          />
        </div>
      )}

      <div>
        <Label htmlFor="passengers" className="block mb-1">
          Number of Passengers
        </Label>
        <Input
          type="number"
          id="passengers"
          value={flight.passengers}
          onChange={(e) =>
            setFlight((prev) => ({
              ...prev,
              passengers: e.target.valueAsNumber,
            }))
          }
          min="1"
          max="9"
          required
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Searching..." : "Search Flights"}
      </Button>
    </form>
  );
}

type BookingContextValue = {
  state: BookingState;
  dispatch: (action: BookingAction) => void;
};

const BookingContext = createContext<BookingContextValue | null>(null);

const BookingProvider = ({ children }: { children: ReactNode }) => {
  const [bookingState, dispatch] = useReducer(
    bookingReducer,
    initialBookingState,
  );

  return (
    <BookingContext.Provider value={{ state: bookingState, dispatch }}>
      {children}
    </BookingContext.Provider>
  );
};

function useBooking() {
  const context = use(BookingContext);
  if (!context) {
    throw new Error("useBooking must be used within BookingProvider");
  }
  return context;
}

function BookingContent() {
  const { state, dispatch } = useBooking();
  const isError = state.status === "error";
  const showResults = state.status === "results";
  console.log("state", state);

  const handleSubmit = async (formData: {
    destination: string;
    departure: string;
    arrival: string;
    passengers: number;
    isOneWay: boolean;
  }) => {
    dispatch({
      type: "submit",
      payload: formData,
    });

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const mockFlights = await getFlightOptions(formData);
      dispatch({
        type: "results",
        flightOptions: mockFlights,
      });
    } catch {
      dispatch({
        type: "error",
      });
    }
  };

  return (
    <div className="mx-auto p-6 w-full max-w-2xl">
      <h1 className="mb-6 font-bold text-2xl">Flight Booking</h1>

      {!showResults ? (
        <>
          <BookingForm onSubmit={handleSubmit} />
          {isError && (
            <div className="bg-red-100 mt-4 p-4 rounded text-red-700">
              An error occurred while searching for flights. Please try again.
            </div>
          )}
        </>
      ) : (
        <SearchResults onBack={() => dispatch({ type: "back" })} />
      )}
    </div>
  );
}

export default function Page() {
  return (
    <BookingProvider>
      <BookingContent />
    </BookingProvider>
  );
}
