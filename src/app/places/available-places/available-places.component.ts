import { Component, DestroyRef, inject, OnInit, signal } from "@angular/core";

import { Place } from "../place.model";
import { PlacesComponent } from "../places.component";
import { PlacesContainerComponent } from "../places-container/places-container.component";
import { map } from "rxjs";
import { PlacesService } from "../places.service";

@Component({
  selector: "app-available-places",
  standalone: true,
  templateUrl: "./available-places.component.html",
  styleUrl: "./available-places.component.css",
  imports: [PlacesComponent, PlacesContainerComponent],
})
export class AvailablePlacesComponent implements OnInit {
  places = signal<Place[] | undefined>(undefined);
  isFetching = signal(false);
  error = signal("");

  private placesService = inject(PlacesService); // inject HttpClient
  private destroyRef = inject(DestroyRef);

  // Fetch the data when up
  ngOnInit() {
    this.isFetching.set(true);
    const subscription = this.placesService.loadAvailablePlaces().subscribe({
      next: (places) => {
        this.places.set(places);
      },
      complete: () => {
        this.isFetching.set(false);
      },
      error: (error: Error) => {
        console.log(error);
        this.error.set(error.message);
      },
    });
    /* save for reference
          const subscription = this.httpClient
          .get<{ places: Place[] }>("http://localhost:3000/places", {
            observe: "response",
            // observe: "events" -- save for reference
          })
          .subscribe({
            next: (response) => {
              console.log(response);
              console.log(response.body?.places);
            },
          });
    */
    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }

  onSelectPlace(selectedPlace: Place) {
    const subscription = this.placesService.addPlaceToUserPlaces(selectedPlace).subscribe({
      next: (respData) => console.log(respData),
      complete: (done: string = "completed") => console.log(done),
      error: (err) => console.log(err),
    });

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }
}
