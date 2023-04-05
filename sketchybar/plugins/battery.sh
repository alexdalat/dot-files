#!/bin/bash

source "$HOME/.config/sketchybar/icons.sh"
source "$HOME/.config/sketchybar/colors.sh"

update() {
	BATTERY_INFO="$(pmset -g batt)"
	PERCENTAGE=$(echo "$BATTERY_INFO" | grep -Eo "\d+%" | cut -d% -f1)
	CHARGING=$(echo "$BATTERY_INFO" | grep 'AC Power')

	if [ $PERCENTAGE = "" ]; then
		exit 0
	fi

	COLOR=$WHITE
	case ${PERCENTAGE} in
		9[0-9]|100) ICON=$BATTERY_100;
		;;
		[6-8][0-9]) ICON=$BATTERY_75;
		;;
		[3-5][0-9]) ICON=$BATTERY_50
		;;
		[1-2][0-9]) ICON=$BATTERY_25; COLOR=$ORANGE
		;;
		*) ICON=$BATTERY_0; COLOR=$RED
	esac

	if [[ $CHARGING != "" ]]; then
		ICON=$BATTERY_CHARGING
	fi

	sketchybar --set $NAME icon="$ICON" icon.color=$COLOR label="$PERCENTAGE%" label.color=$COLOR
}

hover () {
  if [[ $1 = "on" ]]; then
	sketchybar --animate tanh 30 --set battery label.width=dynamic
  else
	sketchybar --animate tanh 30 --set battery label.width=0
  fi
}

case "$SENDER" in
  "mouse.entered") hover on
  ;;
  "mouse.exited"|"mouse.exited.global") hover off
  ;;
  "forced") exit 0
  ;;
  *) update
esac