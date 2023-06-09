#!/bin/bash

calendar=(
  icon.font="$FONT:Black:12.0"
  icon.padding_right=5
  label.align=right
  label.y_offset=1
  icon.y_offset=1

  padding_left=10
  update_freq=10
  script="$PLUGIN_DIR/calendar.sh"
  click_script="$PLUGIN_DIR/zen.sh"
)

sketchybar --add item calendar right       \
           --set calendar "${calendar[@]}" \
           --subscribe calendar system_woke
