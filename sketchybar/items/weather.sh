#!/bin/bash

source "$HOME/.config/sketchybar/colors.sh"

weather=(
  icon.font="$FONT:Semibold:18.0"
  icon.color=$WHITE
  icon.padding_right=0
  icon.y_offset=2
  label.padding_right=0
  label.color=$WHITE
  label.align=right
  label.font="$FONT:Semibold:13.0"
  background.drawing=off
  padding_left=5
  padding_right=5
  update_freq=300
  script="$PLUGIN_DIR/weather.sh"
)

sketchybar --add item weather right\
           --set weather "${weather[@]}"