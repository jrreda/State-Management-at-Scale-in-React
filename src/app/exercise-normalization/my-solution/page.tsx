"use client";

import { useReducer, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, MapPin, CheckSquare } from "lucide-react";

// IDs
declare const __brand: unique symbol;
export type Brand<T, TBrand extends string> = T & {
  readonly [__brand]: TBrand;
};

type DestinationId = Brand<string, "DestinationId">;
type TodoId = Brand<string, "TodoId">;

// Types
interface TodoItem {
  id: TodoId;
  text: string;
  destinationId: string;
}

interface Destination {
  id: DestinationId;
  name: string;
}

interface ItineraryState {
  destinations: Destination[];
  todos: TodoItem[];
}

// Action types
type Action =
  | { type: "ADD_DESTINATION" }
  | { type: "UPDATE_DESTINATION"; destinationId: string; name: string }
  | { type: "DELETE_DESTINATION"; destinationId: string }
  | { type: "ADD_TODO"; destinationId: string; text: string }
  | { type: "DELETE_TODO"; destinationId: string; todoId: string };

// Reducer function
function itineraryReducer(
  state: ItineraryState,
  action: Action,
): ItineraryState {
  switch (action.type) {
    case "ADD_DESTINATION":
      return {
        ...state,
        destinations: [
          ...state.destinations,
          { id: crypto.randomUUID() as DestinationId, name: "" },
        ],
      };
    case "UPDATE_DESTINATION":
      return {
        ...state,
        destinations: state.destinations.map((dest) =>
          dest.id === action.destinationId
            ? { ...dest, name: action.name }
            : dest,
        ),
      };
    case "DELETE_DESTINATION":
      return {
        ...state,
        destinations: state.destinations.filter(
          (dest) => dest.id !== action.destinationId,
        ),
        todos: state.todos.filter(
          (todo) => todo.destinationId !== action.destinationId,
        ),
      };
    case "ADD_TODO":
      return {
        ...state,
        todos: [
          ...state.todos,
          {
            id: crypto.randomUUID() as TodoId,
            text: action.text,
            destinationId: action.destinationId,
          },
        ],
      };
    case "DELETE_TODO":
      return {
        ...state,
        todos: state.todos.filter((todo) => todo.id !== action.todoId),
      };
    default:
      return state;
  }
}

export default function ItineraryPage() {
  const [state, dispatch] = useReducer(itineraryReducer, {
    destinations: [],
    todos: [],
  });
  const lastInputRef = useRef<HTMLInputElement>(null);

  const handleAddDestination = () => {
    dispatch({ type: "ADD_DESTINATION" });
    // Focus the new input after render
    setTimeout(() => {
      lastInputRef.current?.focus();
    }, 0);
  };

  return (
    <div className="mx-auto p-6 max-w-4xl container">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <MapPin className="w-8 h-8 text-primary" />
          <h1 className="font-bold text-4xl tracking-tight">
            Travel Itinerary
          </h1>
        </div>

        <Button onClick={handleAddDestination} size="lg" className="mb-6">
          <Plus className="w-4 h-4" />
          Add Destination
        </Button>

        <div className="space-y-6">
          {state.destinations.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col justify-center items-center py-12">
                <MapPin className="mb-4 w-12 h-12 text-muted-foreground" />
                <p className="text-muted-foreground text-center">
                  No destinations yet. Click &ldquo;Add Destination&rdquo; to
                  start planning your trip!
                </p>
              </CardContent>
            </Card>
          ) : (
            state.destinations.map((destination, index) => (
              <Card key={destination.id} className="relative">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    <CardTitle className="flex-1">
                      <Input
                        type="text"
                        value={destination.name}
                        onChange={(e) =>
                          dispatch({
                            type: "UPDATE_DESTINATION",
                            destinationId: destination.id,
                            name: e.target.value,
                          })
                        }
                        placeholder="Enter destination name"
                        className="px-0 focus-visible:border-primary focus-visible:border-b-2 border-none rounded-none focus-visible:ring-0 font-semibold text-lg"
                        ref={
                          index === state.destinations.length - 1
                            ? lastInputRef
                            : null
                        }
                      />
                    </CardTitle>
                  </div>
                  <CardAction>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        dispatch({
                          type: "DELETE_DESTINATION",
                          destinationId: destination.id,
                        })
                      }
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardAction>
                </CardHeader>

                <CardContent className="space-y-4">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.target as HTMLFormElement;
                      const input = form.elements.namedItem(
                        "todo",
                      ) as HTMLInputElement;
                      if (input.value.trim()) {
                        dispatch({
                          type: "ADD_TODO",
                          destinationId: destination.id,
                          text: input.value.trim(),
                        });
                        input.value = "";
                      }
                    }}
                    className="flex gap-2"
                  >
                    <Input
                      type="text"
                      name="todo"
                      placeholder="Add a todo item (e.g., Visit museum, Try local cuisine)"
                      className="flex-1"
                    />
                    <Button type="submit" size="sm">
                      <Plus className="w-4 h-4" />
                      Add
                    </Button>
                  </form>

                  {state.todos.length > 0 ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckSquare className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium text-muted-foreground text-sm">
                          Things to do
                        </span>
                        <Badge variant="secondary">{state.todos.length}</Badge>
                      </div>
                      <ul className="space-y-2">
                        {state.todos.map((todo) => (
                          <li
                            key={todo.id}
                            className="flex items-center gap-3 hover:bg-muted/50 p-2 rounded-md transition-colors"
                          >
                            <div className="flex-shrink-0 bg-primary rounded-full w-2 h-2" />
                            <span className="flex-1 text-sm">{todo.text}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                dispatch({
                                  type: "DELETE_TODO",
                                  destinationId: destination.id,
                                  todoId: todo.id,
                                })
                              }
                              className="p-1 h-auto text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="py-4 text-muted-foreground text-sm text-center">
                      No activities added yet. Add some things to do at this
                      destination!
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <div className="flex gap-2 pt-6 border-t">
        <Button variant="outline" disabled>
          Undo
        </Button>
        <Button variant="outline" disabled>
          Redo
        </Button>
      </div>
    </div>
  );
}
