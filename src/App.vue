<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
  <NoiFlightControl :options="{
    language: language,
    langPack: JSON.parse(langPack),
    theme: theme,
    timezone: timezone,
    maxforecast: maxforecast,
    rest_endpoint: restendpoint,
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
    theme: {
      type: String,
      // "OpenDataHub" || "skyalps"
      default: "OpenDataHub"
    },
    restendpoint: {
      type: String,
      default: "https://mobility.api.opendatahub.com/v2/flat%2Cnode/Flight?"
    },
    timezone: {
      type: String,
      default: "local"
      // https://www.npmjs.com/package/tzdata list
    },
    maxforecast: {
      type: Number,
      default: 10
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
  },
  created(){
    // add default fonts
    const fontOdh = document.createElement("link");
    fontOdh.type = "text/css";
    fontOdh.rel = "stylesheet";
    fontOdh.href = "https://fonts.testingmachine.eu/source-sans-pro/style.css";
    document.head.appendChild(fontOdh);
    const fontSkyalps = document.createElement("link");
    fontSkyalps.type = "text/css";
    fontSkyalps.rel = "stylesheet";
    fontSkyalps.href = "https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed:wght@300&display=swap";
    document.head.appendChild(fontSkyalps);
  }
}
</script>
