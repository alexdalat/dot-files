#!/bin/bash

battery=(
  script="$PLUGIN_DIR/battery.sh"
  padding_right=0
  padding_left=0

  label.font="$FONT:Regular:19.0"

  icon.drawing=on
  icon.padding_left=2
  icon.width=0
  icon.font.size=14
  icon.color=$TRANSPARENT

  update_freq=120
  updates=on
)

sketchybar --add item battery right      \
           --set battery "${battery[@]}" \
           --subscribe battery power_source_change system_woke \
           --subscribe battery mouse.entered mouse.exited \
