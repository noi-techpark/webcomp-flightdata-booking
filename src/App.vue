<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
  <NoiFlightControl :options="{
    language: language,
    langPack: JSON.parse(langPack),
    colors: JSON.parse(colors),
    theme: theme,
    tableheight: tableheight,
    timezoneSwitcher: timezoneswitch,
    metricUnits: metricunits,
    timezone: timezone,
    timezones: JSON.parse(timezones),
    maxforecast: maxforecast,
    wss_endpoint: wssendpoint,
    rest_endpoint: restendpoint,
    filters: JSON.parse(filters),
    columns: JSON.parse(columns)
  }" />
</template>

<script>
import Vue from "vue"


import NoiFlightControl from "./components/NoiFlightControl.vue"

// TODO: 4MB (!) unused payload => https://github.com/ghettovoice/vuelayers/issues/319
import { Map, TileLayer, OsmSource, Feature, Style } from 'vuelayers'

Vue.use(Map)
Vue.use(TileLayer)
Vue.use(OsmSource)
Vue.use(Feature)
Vue.use(Style)

export default {
  name: "App",
  props: {
    id: {
      type: String,
      default: ""
    },
    styleurl: {
      type: String,
      default: ""
    },
    language: {
      type: String,
      default: "en"
    },
    langPack: {
      type: String,
      default: "{}"
    },
    // disabled / obsolete?: click clock instead
    timezoneswitch: {
      type: Boolean,
      default: false
    },
    metricunits: {
      type: Boolean,
      default: true
    },
    theme: {
      type: String,
      // "terminal" || "skyalps"
      default: "terminal"
    },
    tableheight: {
      type: String,
      default: "auto"
    },
    // airports: {
    //   type: String,
    //   default: () => {
    //     return JSON.stringify([])
    //   }
    // },
    timezone: {
      type: String,
      default: "local"
      // https://www.npmjs.com/package/tzdata list
    },
    wssendpoint: {
      type: String,
      default: "wss://ws.datapool.opendatahub.testingmachine.eu/flightdata/sbs-aggregated"
    },
    restendpoint: {
      type: String,
      default: "https://mobility.api.opendatahub.com/v2/flat%2Cnode/Flight?"
    },
    maxforecast: {
      type: Number,
      default: 100
    },
    colors: {
      type: String,
      default: () => {
        return JSON.stringify({
          primary: "#0068B4",
          secondary: "#555555",
          primary_contrast: "#ffffff",
          secondary_contrast: "#ffffff"
        })
      }
    },
    filters: {
      type: String,
      default: () => {
        return JSON.stringify({
          from_ts: false,
          to_ts: false,
          airport: "BZO"
        })
      }
    },
    columns: {
      type: String,
      default: () => {
        return JSON.stringify({
          date: true,
          time: true,
          airline: true,
          fromto: true,
          flightnumber: true,
          remark: true,
          gate: true,
          ticketlink: true,
          morebutton: true,
        })
      }
    },
    timezones: {
      type: String,
      default: () => {
        return JSON.stringify([
          {
            label: "UTC",
            code: "UTC"
          },
          {
            label: "Local time",
            code: "local"
          }
        ])
      }
    }
  },
  components: {
    NoiFlightControl
  },
  mounted: async function () {
    if (this.styleurl != "") {
      const elem = document.getElementById(this.id)
      if (!elem) {
        console.log("you must give the element an id so that external css-files can be applied")
      }

      var externalStyles = document.createElement("style")

      fetch(this.styleurl)
        .then((response) => response.text())
        .then((data) => {
          externalStyles.innerHTML = data
          elem.shadowRoot.appendChild(externalStyles)
        })
        .catch((error) => {
          console.error("wrong stylesheet url. styles can not be applied. cors disabled (?)")
        })
    }
  }
}
</script>
