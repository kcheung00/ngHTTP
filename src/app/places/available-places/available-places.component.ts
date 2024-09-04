import { Component, DestroyRef, inject, OnInit, signal } from "@angular/core";

import { Place } from "../place.model";
import { PlacesComponent } from "../places.component";
import { PlacesContainerComponent } from "../places-container/places-container.component";
import { HttpClient } from "@angular/common/http";
import { map } from "rxjs";

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
  error = signal('');

  private httpClient = inject(HttpClient); // inject HttpClient
  private destroyRef = inject(DestroyRef);
  // constructor(private httpClient: HttpClient){}; // same as above
  // constructor(private destroyRef: DestroyRef){}; - error multiple constructor

  // Fetch the data when up
  ngOnInit() {
    this.isFetching.set(true);
    const subscription = this.httpClient
      .get<{ places: Place[] }>("http://localhost:3000/places")
      .pipe(map((resData) => resData.places))
      .subscribe({
        next: (places) => {
          this.places.set(places);
        },
        complete: () => {
          this.isFetching.set(false);
        },
        error: (error) => {
          console.log(error);
          this.error.set('Something wrong here.');
        }
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
}
