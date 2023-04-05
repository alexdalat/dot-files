#!/bin/bash

source "$HOME/.config/sketchybar/colors.sh"

dnd=(
  icon.font="$FONT:Regular:14.0"
  icon.color=$WHITE
  icon.padding_left=8
  icon.padding_right=3
  padding_left=0
  padding_right=0
  icon.y_offset=0
  background.drawing=off
  update_freq=60
  script="$PLUGIN_DIR/dnd.sh"
)

sketchybar --add item dnd right\
           --set dnd "${dnd[@]}"\
		   --add event dnd_toggle \
		   --subscribe dnd system_woke dnd_toggle \