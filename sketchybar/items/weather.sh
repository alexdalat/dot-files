#!/bin/bash

source "$HOME/.config/sketchybar/colors.sh"

weather=(
  icon.font="Hack Nerd Font:Regular:16.0"
  icon.color=$WHITE
  icon.padding_right=2
  icon.y_offset=0
  label.padding_right=3
  label.color=$WHITE
  label.align=right
  label.y_offset=0
  background.drawing=off
  update_freq=300
  updates=on
  script="$PLUGIN_DIR/weather.sh"
  click_script="$PLUGIN_DIR/weather.sh"
)

sketchybar --add item weather right\
           --set weather "${weather[@]}"\
		   --subscribe calendar system_woke