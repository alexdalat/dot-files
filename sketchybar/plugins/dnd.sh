#!/bin/bash

source "$HOME/.config/sketchybar/icons.sh"
source "$HOME/.config/sketchybar/colors.sh"

# adapted to bash from: https://gist.github.com/drewkerr/0f2b61ce34e2b9e3ce0ec6a92ab05c18
DND_STATUS=$(cat ~/Library/DoNotDisturb/DB/Assertions.json | jq '.data[0]'.storeAssertionRecords)
# returns null if off or a json if on

COLOR=$WHITE

if [[ "$DND_STATUS" != null ]]; then
  sketchybar --animate tanh 30 --set dnd icon=$DND icon.color=$COLOR icon.width=dynamic
else
  sketchybar --animate tanh 30 --set dnd icon.width=0
fi