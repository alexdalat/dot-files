#!/bin/bash

SPACE_ICONS=("1" "2" "3" "4" "5" "6" "7" "8" "9" "10" "11" "12" "13" "14" "15")

# Destroy space on right click, focus space on left click.
# New space by left clicking separator (>)

sid=0
spaces=()
for i in "${!SPACE_ICONS[@]}"
do
  sid=$(($i+1))

  space=(
    associated_space=$sid
    icon="${SPACE_ICONS[i]}"
    icon.padding_left=10
	icon.width=30
    icon.padding_right=0
    padding_right=6
	label.padding_left=-5
    label.padding_right=20
    icon.color=$WHITE
    icon.highlight_color=$RED
    label.color=$GREY
    label.highlight_color=$WHITE
    label.font="sketchybar-app-font:Regular:16.0"
    label.y_offset=-1
    background.color=$TRANSPARENT #BACKGROUND_1
    background.border_color=$BACKGROUND_2 #BACKGROUND_2
    background.drawing=on
    label.drawing=off
    script="$PLUGIN_DIR/space.sh"
  )

  sketchybar --add space space.$sid left    \
             --set space.$sid "${space[@]}" \
             --subscribe space.$sid mouse.clicked
done

spaces_bracket=(
  background.color=$BACKGROUND_1
  background.border_color=$BACKGROUND_2
  background.border_width=2
)

separator=(
  icon=􀆊
  icon.font="$FONT:Heavy:14.0"
  padding_left=3
  padding_right=8
  label.drawing=off
  associated_display=active
  click_script='yabai -m space --create && sketchybar --trigger space_change'
  icon.color=$WHITE
)

# removed "--set spaces_bracket "${spaces_bracket[@]}" \" after '--add bracket ...' to clean up view
sketchybar --add bracket spaces_bracket '/space\..*/'  \
                                                       \
           --add item separator left                   \
           --set separator "${separator[@]}"
