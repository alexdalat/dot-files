#!/bin/bash

source "$HOME/.config/sketchybar/icons.sh"
source "$HOME/.config/sketchybar/colors.sh"

DND_STATUS=$(plutil -extract "NSStatusItem Visible FocusModes" raw -o - -- $HOME/Library/Preferences/com.apple.controlcenter.plist)

COLOR=$WHITE

if [ "$DND_STATUS" = true ]; then
  sketchybar --set dnd icon=$DND icon.drawing=on
else
  sketchybar --set dnd icon.drawing=off
fi

sketchybar --set dnd icon=$DND icon.color=$COLOR
