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

	BATTERY_COLOR=$WHITE
	case ${PERCENTAGE} in
		9[0-9]|100) ICON=$BATTERY_100;
		;;
		[6-8][0-9]) ICON=$BATTERY_75;
		;;
		[2-5][0-9]) ICON=$BATTERY_50
		;;
		[1][0-9]) ICON=$BATTERY_25; BATTERY_COLOR=$ORANGE
		;;
		*) ICON=$BATTERY_0; BATTERY_COLOR=$RED
	esac

	if [[ $CHARGING != "" ]]; then
		ICON=$BATTERY_CHARGING
	fi

	sketchybar --set $NAME label="$ICON" label.color=$BATTERY_COLOR icon="$PERCENTAGE%"
	echo $BATTERY_COLOR
}

hover () {
  BATTERY_COLOR=$(update)
  if [[ $1 = "on" ]]; then
	sketchybar --animate tanh 30 --set battery icon.width=dynamic icon.color=$BATTERY_COLOR
  else
	sketchybar --animate tanh 30 --set battery icon.width=0 icon.color=$TRANSPARENT
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