"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { getFlightOptions } from "@/app/exerciseUtils";

interface FlightOption {
  id: string;
  airline: string;
  price: number;
  duration: string;
}

function FlightBooking() {
  const [flight, setFlight] = useState({
    destination: "",
    departure: "",
    arrival: "",
    passengers: 1,
    isRoundtrip: false,
  });

  type State =
    | { status: "idle" }
    | { status: "submitting" }
    | { status: "error"; error: string }
    | { status: "success" };
  const [state, setState] = useState<State>({ status: "idle" });
  const isSubmitting = state.status === "submitting";

  const [flightOptions, setFlightOptions] = useState<FlightOption[]>([]);

  const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null);
  const selectedFlight = flightOptions.find(
    (flight) => flight.id === selectedFlightId,
  );
  const totalPrice = selectedFlight
    ? selectedFlight.price * flight.passengers
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setState({ status: "submitting" });
    setSelectedFlightId(null);

    try {
      const flights = await getFlightOptions(flight);

      setFlightOptions(flights);

      setState({ status: "success" });
    } catch {
      setState({
        status: "error",
        error:
          "An error occurred while searching for flights. Please try again!",
      });
    }
  };

  const handleFlightSelect = (flight: FlightOption) => {
    setSelectedFlightId(flight.id);
  };

  return (
    <div className="mx-auto p-6 w-full max-w-2xl">
      <h1 className="mb-6 font-bold text-2xl">Flight Booking</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center space-x-2 mb-4">
          <Switch
            id="roundtrip"
            checked={flight.isRoundtrip}
            onCheckedChange={(checked) =>
              setFlight((prev) => ({ ...prev, isRoundtrip: checked }))
            }
          />
          <Label htmlFor="roundtrip">Roundtrip flight</Label>
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

        {flight.isRoundtrip && (
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

      {state.status === "error" && (
        <div className="bg-red-100 mt-4 p-4 rounded text-red-700">
          {state.error}
        </div>
      )}

      {state.status === "success" && flightOptions.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 font-semibold text-xl">Available Flights</h2>
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
                      onClick={() => handleFlightSelect(flight)}
                    >
                      {selectedFlight?.id === flight.id ? "Selected" : "Select"}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedFlight && (
        <div className="bg-gray-50 mt-8 p-4 rounded-lg">
          <h3 className="mb-2 font-semibold text-lg">Booking Summary</h3>
          <div className="space-y-2">
            <p>Flight: {selectedFlight.airline}</p>
            <p>Duration: {selectedFlight.duration}</p>
            <p>Passengers: {flight.passengers}</p>
            <p className="mt-4 font-bold text-xl">Total: ${totalPrice}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Page() {
  return <FlightBooking />;
}
