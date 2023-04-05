#!/bin/bash

battery=(
  script="$PLUGIN_DIR/battery.sh"
  icon.font="$FONT:Regular:19.0"
  padding_right=2
  padding_left=3
  label.drawing=on
  label.padding_left=5
  label.width=0
  update_freq=120
  updates=on
)

sketchybar --add item battery right      \
           --set battery "${battery[@]}" \
           --subscribe battery power_source_change system_woke \
           --subscribe battery mouse.entered mouse.exited mouse.exited.global \
