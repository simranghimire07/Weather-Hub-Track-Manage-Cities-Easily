'use strict';

import { fetchData, url } from "./api.js";
import * as module from "./module.js"; 

const addEventOnElement = function (elements, eventType, callback){
        for(const element of elements){
                element.addEventListener(eventType, callback);
        }
 }


//  search toggle

const searchView = document.querySelector("[data-search-view]");
const searchToggle = document.querySelectorAll("[data-search-toggle]");

const toggleSearch = () => searchView.classList.toggle("active");
addEventOnElement(searchToggle, "click", toggleSearch);


// search integration

const searchField = document.querySelector("[data-search-field]");
const searchResult = document.querySelector("[data-search-result]");

let searchTimeout = null;
const searchTimeoutDuration = 500;

searchField.addEventListener("input", function(){
        searchTimeout ?? clearTimeout(searchTimeout);

        if(!searchField.value){
                searchResult.classList.remove("active");
                searchResult.innerHTML = "";
                searchField.classList.remove("searching");
        }
        else{
                searchField.classList.add("searching");
        }

        if(searchField.value){
                searchTimeout = setTimeout(() => {
                        fetchData(url.geo(searchField.value), function(locations){
                                searchField.classList.remove("searching");
                                searchResult.classList.add("active");
                                searchResult.innerHTML = `
                                        <ul class="view-list" data-search-list></ul>
                                `;

                                const items = [];
                                for(const {name, lat, lon, country, state} of locations){
                                        const searchItem = document.createElement("li");
                                        searchItem.classList.add("view-item");

                                        searchItem.innerHTML = `
                                                <span class="icons">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>
                                                </span>
                                                        
                                                <div>
                                                        <p class="item-title">${name}</p>
                                                        <p class="item-subtitle">${state || ""} ${country}</p>
                                                </div>
                                                <a href="#/weather?lat=${lat}&lon=${lon}" class="item-link has-state" aria-label="${name} weather" data-search-toggle></a>
                                        `;

                                        searchResult.querySelector("[data-search-list]").appendChild(searchItem);  
                                        items.push(searchItem.querySelector("[data-search-toggle]"));
                                }
                                addEventOnElement(items, "click", function (){
                                        toggleSearch();
                                        searchResult.classList.remove("active");
                                })
                        })
                }, searchTimeoutDuration)
        }
});

const container = document.querySelector("[data-container]");

const loading = document.querySelector("[data-loading]");

const currentLocationBtn = document.querySelector("[data-current-location-btn]");

const errorContent = document.querySelector("[data-error-content]");

export const updateWeather = function (lat, lon){

        loading.style.display = "grid";
        container.style.overflowY = "hidden";
        container.classList.remove("fade-in");
        errorContent. style.display = "none";


        const currentWeatherSection = document.querySelector("[data-current-weather]");
        const forecastSection = document.querySelector("[data-5-days-weather-forecast]");
        const highlightSection = document.querySelector("[data-highlight-details]");
        const hourlySection = document.querySelector("[data-hourly-forecast]");

        currentWeatherSection.innerHTML = "";
        forecastSection.innerHTML = "";
        highlightSection.innerHTML = "";
        hourlySection.innerHTML = "";

        if(window.location.hash === "#/current-location"){
                currentLocationBtn.setAttribute("disabled", "");
        }
        else{
                currentLocationBtn.removeAttribute("disabled");
        }


        // current weather section

        fetchData(url.currentWeather(lat, lon), function(currentWeather){

                const {
                        weather,
                        dt: dateUnix,
                        sys: {sunrise: sunriseUnixUTC, sunset: sunsetUnixUTC},
                        main: {temp, feels_like, pressure, humidity},
                        visibility,
                        timezone
                } = currentWeather;

                const [{description, icon}] = weather;

                const card =  document.createElement("div")

                card.classList.add("card", "card-lg", "current-weather-card");

                card.innerHTML = `
                        <h2 class="card-title">Now</h2>
                        <div class="wrapper">
                                <p class="heading">${parseInt(temp)}&deg;<sup>c</sup></p>
                                <img src="assets/weather_icons/${icon}.png" width="64" height="64" alt="${description}" class="weather-icon">
                        </div>
                        <p class="text-2xl font-semibold capitalize">${description}</p>
                        <ul class="meta-list">
                                <li class="meta-item">
                                        <span class="icons">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-calendar"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>   
                                        </span>
                                        <p class="meta-text text-2xl">${module.getDate(dateUnix, timezone)}</p>
                                </li>
                                <li class="meta-item">
                                        <span class="icons">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>
                                        </span>
                                        <p class="meta-text text-2xl" data-location></p>
                                </li>
                        </ul>
                `;
                fetchData(url.reverseGeo(lat, lon), function([{name, country}]){
                      card.querySelector("[data-location]").innerHTML = `${name}, ${country}`  
                });

                currentWeatherSection.appendChild(card);


                // today's highlight section

                fetchData(url.airPollution(lat, lon), function(airPollution){
                        const [{
                                main: { aqi },
                                components: { no2, o3, so2, pm2_5}
                        }] = airPollution.list;

                        const card = document.createElement("div");
                        card.classList.add("card", "card-lg");

                        card.innerHTML = `
                        <h2 class="text-3xl mb-3 text-2" id="highlights-label">Todays Highlights</h2>
                        <div class="highlight-detail-list">
                                <div class="card card-sm highlight-card one">
                                        <h3 class="text-2xl font-semibold mb-5 title">Air Quality Index</h3>

                                        <div class="wrapper">
                                                <span class="icons">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-wind"><path d="M12.8 19.6A2 2 0 1 0 14 16H2"/><path d="M17.5 8a2.5 2.5 0 1 1 2 4H2"/><path d="M9.8 4.4A2 2 0 1 1 11 8H2"/></svg>                                                                        
                                                </span>

                                                <ul class="card-list">
                                                        <li class="card-item">
                                                                <p class="text-4xl title-1">${pm2_5.toPrecision(3)}</p>   
                                                                <p class="text-2xl label-1 mb-1">PM<sub>2.5</sub></p>
                                                        </li>

                                                        <li class="card-item">
                                                                <p class="text-4xl title-1">${so2.toPrecision(3)}</p>   
                                                                <p class="text-2xl label-1 mb-1">SO<sub>2</sub></p>
                                                        </li>

                                                        <li class="card-item">
                                                                <p class="text-4xl title-1">${no2.toPrecision(3)}</p>   
                                                                <p class="text-2xl label-1 mb-1">NO<sub>2</sub></p>
                                                        </li>

                                                        <li class="card-item">
                                                                <p class="text-4xl title-1">${o3.toPrecision(3)}</p>   
                                                                <p class="text-2xl label-1 mb-1">O<sub>3</sub></p>
                                                        </li>
                                                </ul>
                                        </div>

                                        <span class="badge aqi-${aqi} text-2xl label-${aqi} mb-1" title="${module.aqiText[aqi].message}">
                                                ${module.aqiText[aqi].level}
                                        </span>
                                </div>

                                <div class="card card-sm highlight-card two">
                                        <h3 class="text-2xl label-1 mb-1 font-semibold mb-5 title">Sunrise & Sunset</h3>
                                        <div class="card-list">
                                                <div class="card-item">
                                                        <span class="icons">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sun"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
                                                        </span>
                                                        <div>
                                                                <p class="text-2xl label-1 mb-1">Sunrise</p>
                                                                <p class="text-4xl title-1">${module.getTime(sunriseUnixUTC, timezone)}</p>
                                                        </div>
                                                </div>
                                                <div class="card-item">
                                                        <span class="icons">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-moon"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>                                                                                
                                                        </span>
                                                        <div>
                                                                <p class="text-2xl label-1 mb-1">Sunset</p>
                                                                <p class="text-4xl title-1">${module.getTime(sunsetUnixUTC, timezone)}</p>
                                                        </div>
                                                </div>
                                        </div>
                                </div>

                                <div class="card card-sm highlight-card">
                                        <h3 class="text-2xl label-1 mb-1 font-semibold mb-5 title">
                                                Humidity
                                        </h3>

                                        <div class="wrapper">
                                                <span class="icons">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-waves"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></svg>                                                                        
                                                </span>

                                                <p class="text-4xl title-1">${humidity}<sub>%</sub></p>
                                        </div>
                                </div>

                                <div class="card card-sm highlight-card">
                                        <h3 class="text-2xl label-1 mb-1 font-semibold mb-5 title">
                                                Pressure
                                        </h3>

                                        <div class="wrapper">
                                                <span class="icons">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-waves"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></svg>                                                                        
                                                 </span>
                                                <p class="text-4xl title-1">${pressure}<sub>hPa</sub></p>
                                        </div>
                                </div>

                                <div class="card card-sm highlight-card">
                                        <h3 class="text-2xl label-1 mb-1 font-semibold mb-5 title">
                                                Visibility
                                        </h3>

                                        <div class="wrapper">
                                                <span class="icons">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>                                                                        
                                                </span> 
                                                <p class="text-4xl title-1">${visibility / 1000}<sub>km</sub></p>
                                        </div>
                                </div>

                                <div class="card card-sm highlight-card">
                                        <h3 class="text-2xl label-1 mb-1 font-semibold mb-5 title">
                                                Feels Like
                                        </h3>

                                        <div class="wrapper">
                                                <span class="icons">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-thermometer-sun"><path d="M12 9a4 4 0 0 0-2 7.5"/><path d="M12 3v2"/><path d="m6.6 18.4-1.4 1.4"/><path d="M20 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/><path d="M4 13H2"/><path d="M6.34 7.34 4.93 5.93"/></svg>
                                                </span>
                                                <p class="text-4xl title-1">${parseInt(feels_like)}&deg;<sup>c</sup></p>
                                        </div>
                                </div>
                        </div>
                        `;

                        highlightSection.appendChild(card);
                })


                // 24hrs forecast section
                fetchData(url.forecast(lat, lon), function (forecast){
                        const {
                                list: forecastList,
                                city: {timezone}
                        } = forecast;

                        hourlySection.innerHTML = `
                                <h2 class="text-3xl mb-3 title-2">Today at</h2>
                                <div class="slider-container">
                                        <ul class="slider-list" data-temp> </ul>

                                        <ul class="slider-list" data-wind> </ul>
                                </div>
                        `;

                        for(const [index, data] of forecastList.entries()) {
                                if( index > 7 ){
                                        break;
                                }

                                const{
                                        dt:dateTimeUnix,
                                        main: {temp},
                                        weather,
                                        wind: {deg: windDirection, speed: windSpeed}
                                } = data;

                                const [{ icon, description}] = weather;

                                const tempLi = document.createElement("li");
                                tempLi.classList.add("slider-item");

                                tempLi.innerHTML = `
                                        <div class="card card-sm slider-card">
                                                <p class="text-2xl body-3">${module.getHours(dateTimeUnix, timezone)}</p>

                                                <img src="assets/weather_icons/${icon}.png" alt="${description}" width="48" height="48" loading="lazy" class="weather-icon" title="${description}">
                                                <p class="text-2xl body-3">${parseInt(temp)}&deg;</p>
                                        </div>
                                `;

                                hourlySection.querySelector("[data-temp]").appendChild(tempLi);

                                const windLi = document.createElement("li");
                                windLi.classList.add("slider-item");

                                windLi.innerHTML = `
                                        <div class="card card-sm slider-card">
                                                <p class="text-2xl body-3">${module.getHours(dateTimeUnix, timezone)}</p>

                                                <img src="assets/weather_icons/direction.png" alt="wind direction" width="48" height="48" loading="lazy" class="weather-icon" title="" style="transform: rotate(${windDirection - 180}deg)">
                                                <p class="text-2xl body-3">${parseInt(module.mps_to_kmh(windSpeed))} km/h</p>
                                        </div>
                                `;

                                hourlySection.querySelector("[data-wind]").appendChild(windLi);


                        }

                         // 5 days weather forecast section 
                        forecastSection.innerHTML = `
                                <h2 class="text-3xl mb-3 title-2" id="forecast-label">5 Days Forecast</h2>

                                <div class="card card-lg forecast-card">
                                        <ul data-forecast-list></ul>
                                </div>
                        `;
                        for (let i = 7, len = forecastList.length; i < len; i += 8) {
                                const{
                                        main: { temp_max},
                                        weather,
                                        dt_txt
                                } = forecastList[i];

                                const [{ icon, description }] = weather;
                                const date =  new Date(dt_txt);

                                const li = document.createElement("li");
                                li.classList.add("[card-item]");

                                li.innerHTML = `
                                <div class="content-wrapper">
                                        <div class="icon-wrapper">
                                                <img src="assets/weather_icons/${icon}.png" width="36" height="36" alt="${description}" class="weather-icon" title="${description}">

                                                <span class="span">
                                                         <p class="text-3xl title-2">${parseInt(temp_max)}&deg;</p>
                                                </span>
                                        </div>
                                        <div class="label-container">
                                                <p class="label-1 text-2xl font-semibold">${date.getDate()} ${module.monthNames[date.getUTCMonth()]}</p>
                                                <p class="label-1 text-2xl font-semibold day-name">${module.weekDayNames[date.getUTCDay()]}</p>
                                        </div>
                                </div>
                                `;
                                forecastSection.querySelector("[data-forecast-list]").appendChild(li);

                        }

                        loading.style.display = "none";
                        container.style.overflowY = "overlay";
                        container.classList.add("fade-in");

                })
        });
}

export const error404 =  function () {
        errorContent.style.display = "flex";
}
