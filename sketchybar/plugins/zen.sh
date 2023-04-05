#!/bin/bash

zen_on() {
  sketchybar --set apple.logo drawing=off \
             --set separator drawing=off \
             --set front_app drawing=off \
             --set volume_icon drawing=off \
			 --set battery drawing=off \
             --set spotify.anchor drawing=off \
			 --set weather drawing=off \
			 --set weather updates=off \
			 --set dnd drawing=off \
			 --set yabai drawing=off
}

zen_off() {
  sketchybar --set apple.logo drawing=on \
             --set separator drawing=on \
             --set front_app drawing=on \
			 --set battery drawing=on \
             --set volume_icon drawing=on \
             --set spotify.anchor drawing=on \
			 --set weather drawing=on \
			 --set weather updates=on \
			 --set dnd drawing=on \
			 --set yabai drawing=on
}

if [ "$1" = "on" ]; then
  zen_on
elif [ "$1" = "off" ]; then
  zen_off
else
  if [ "$(sketchybar --query apple.logo | jq -r ".geometry.drawing")" = "on" ]; then
    zen_on
  else
    zen_off
  fi
fi

