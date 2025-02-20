'use strict';


export const weekDayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
];


export const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
];

export const getDate = function (dateUnix, timezone){
        const date = new Date((dateUnix + timezone) * 1000);
        const weekDayName = weekDayNames[date.getUTCDay()];
        const monthName = monthNames[date.getUTCMonth()];

        return `${weekDayName}, ${date.getUTCDate()} ${monthName}`;
       
}


export const getTime = function (dateUnix, timezone){
        const date = new Date((dateUnix + timezone) * 1000);
        const hours = date.getUTCHours();
        const minutes = date.getUTCMinutes();
        const period = hours >= 12 ? "PM" : "AM";

        return `${hours % 12 || 12}:${minutes} ${period}`;

}


export const getHours = function (dateUnix, timezone){
        const date = new Date((dateUnix + timezone) * 1000);
        const hours = date.getUTCHours();
        const period = hours >= 12 ? "PM" : "AM";

        return `${hours % 12 || 12} ${period}`;

}


export const mps_to_kmh = mps => {
        const mph = mps * 3600;
        return mph / 1000;
}


export const aqiText = {
        1: {
                level: "Good",
                message: "Air quality is considered satisfactory, and air pollution poses little or no risk."
        },
        2:{
                level: "Fair",
                message: "Air quality is acceptable; however, for some pollutants there may be a moderate health concern for a very small number of people who are unusually sensitive to air pollution."
        },
        3:{
                level: "Moderate",
                message: "Members of sensitive groups may experience health effects. The general public is not likely to be affected."
        },
        4:{
                level: "Poor",
                message: "Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects."
        },
        5:{
                level: "Very Poor",
                message: "Health alert: everyone may experience more serious health effects."
        }
}



