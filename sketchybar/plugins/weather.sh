#!/bin/bash

weathercode_selector+=(
	["0"]="󰖙", # Clear sky
	["1"]="󰖙", # Mainly clear
	["2"]="󰖐", # Partly cloudy
	["3"]="󰖐", # Overcast
	["45"]="", # Fog
	["48"]="", # Fog
	["51"]="", # Light drizzle
	["53"]="", # Moderate drizzle
	["55"]="", # Dense drizzle
	["56"]="", # Light freezing drizzle
	["57"]="", # Dense freezing drizzle
	["61"]="", # Slight rain
	["63"]="", # Moderate rain
	["65"]="", # Heavy rain
	["66"]="", # Light freezing rain
	["67"]="", # Heavy freezing rain
	["71"]="󰖘", # Light snow fall
	["73"]="󰖘", # Moderate snow fall
	["75"]="󰖘", # Heavy snow fall
	["77"]="󰖘", # Snow grains ??
	["80"]="", # Light rain showers
	["81"]="", # Moderate rain showers
	["82"]="", # Violent rain showers
	["85"]="", # Light snow shower
	["86"]="", # Moderate snow shower
	["95"]="󰖓", # Thunderstorm
	["96"]="󰖓", # Thunderstorm
	["99"]="󰖓" # Thunderstorm
)

export LAT="$(curl -sX GET "https://ipinfo.io" | jq ".loc" | grep -oE "(-*[0-9]*\.[0-9]*)" | sed -n 1p)"
export LONG="$(curl -sX GET "https://ipinfo.io" | jq ".loc" | grep -oE "(-*[0-9]*\.[0-9]*)" | sed -n 2p)"

if [[ -z "$LAT" ]] || [[ -z "$LONG" ]]; then
	echo "Error: Could not get location"
	exit 1
fi

export URL="https://api.open-meteo.com/v1/forecast?latitude=$LAT&longitude=$LONG&hourly=temperature_2m,weathercode&current_weather=true&temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=inch&timeformat=unixtime&timezone=America%2FChicago"

export TEMPERATURE="$(curl -sX GET $URL | jq ".current_weather.temperature")"
export WEATHERCODE="$(curl -sX GET $URL | jq ".current_weather.weathercode")"

TEMPERATURE_ROUNDED=$(echo "($TEMPERATURE + 0.5)/1" | bc) # round to nearest integer
TEMPERATURE_STR="$TEMPERATURE_ROUNDED$(echo °)F" # add degree symbol

ICON=$(echo "${weathercode_selector[$WEATHERCODE]}" | tr "," " ") # get weather icon and remove comma

echo "Updating weather: $ICON $TEMPERATURE_STR"
sketchybar --set $NAME icon="$ICON" label=$TEMPERATURE_STR
