import L from "leaflet"

export function shuttleBusDivIcon(opts: {
  selected?: boolean
  full?: boolean
}): L.DivIcon {
  const { selected, full } = opts
  const classes = [
    "shuttle-bus-marker__inner",
    selected && "shuttle-bus-marker__inner--selected",
    full && "shuttle-bus-marker__inner--full",
  ]
    .filter(Boolean)
    .join(" ")
  return L.divIcon({
    className: "shuttle-bus-marker",
    html: `<div class="${classes}">🚐</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  })
}
