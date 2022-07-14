/* eslint-disable no-unused-vars */
'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

let map, mapEvent;

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    function (position) {
      // console.log(position);
      const { latitude } = position.coords;
      const { longitude } = position.coords;

      // console.log(latitude, longitude);
      // console.log(`https://www.google.ca/maps/@${latitude},${longitude}`);

      map = L.map('map').setView([latitude, longitude], 13);

      // L is a nameSpace that Leaflet gives us
      // L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      //   attribution:
      //     '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors', //choose different theme for tile
      // }).addTo(map);
      L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      }).addTo(map);

      L.marker([latitude, longitude])
        .addTo(map)
        .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
        .openPopup();

      // Handling clicks on map
      map.on('click', function (mapE) {
        mapEvent = mapE;
        form.classList.remove('hidden');
        inputDistance.focus(); //moves cursor to that form
      });

      // console.log(L);
    },
    //if the geolocation fails/blocked then run this:
    function () {
      alert('Could not get your position');
    }
  );
}

//whenever form is submitted (could be done by pressing enter)
form.addEventListener('submit', function (e) {
  e.preventDefault(); //stop page from automatically loading

  // Clear input fields
  inputDistance.value =
    inputDuration.value =
    inputCadence.value =
    inputElevation.value =
      '';

  //display marker
  const { lat: latMarker, lng: lngMarker } = mapEvent.latlng;
  console.log(latMarker, lngMarker);

  L.marker([latMarker, lngMarker])
    //all of the methodes below are attached to marker's prototype
    .addTo(map)
    .bindPopup(
      L.popup({
        maxWidth: 250,
        minWidth: 100,
        autoClose: false,
        closeOnClick: false,
        className: 'running-popup',
      })
    )
    .setPopupContent('workout')
    .openPopup();
});

inputType.addEventListener('change', function (e) {
  //if the parent is has class "form__row--hidden" then remove it, otherwise add it. (bassically do a swap)

  //getting closest parent that has class .form__row
  inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  inputCadence.closest('.form__row').classList.toggle('form__row--hidden');

  // another way to possibly due this
  // if (e.target.value === 'running')
});
