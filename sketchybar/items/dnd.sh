#!/bin/bash

source "$HOME/.config/sketchybar/colors.sh"

dnd=(
  icon.font="$FONT:Semibold:18.0"
  icon.color=$WHITE
  icon.padding_right=0
  icon.y_offset=2
  background.drawing=off
  padding_left=5
  padding_right=5
  update_freq=5
  script="$PLUGIN_DIR/dnd.sh"
)

sketchybar --add item dnd right\
           --set dnd "${dnd[@]}"