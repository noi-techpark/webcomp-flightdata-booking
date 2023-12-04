<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
  <div :class="'noi-flightdata-booking global ' + device + ' ' + options.theme" v-show="options" ref="viewport" style="width: 100%;  position: relative;"> <!-- height: 100%; min-height:200px; -->
    <div class="container-fluid">
        <div class="row noi-top-bar">
            <div class="col">
                <img v-if="options.theme == 'skyalps'" :src="require('@/assets/icons/skyalpsl-full-alt-trasp.png')" />
                <img v-else :src="require('@/assets/icons/odh.svg')" />
            </div>
        </div>
        <div class="row noi-description-bar" v-if="!showResults">
            <div class="col">
                <h2>BOOK A FLIGHT</h2>
                <p>Search for SkyAlps flights and book online. See our routes and schedules, and discover more about the experience you can look forward to on board.</p>
            </div>
        </div>
    </div>

    <!-- search container -->
    <div class="container noi-search-fields-container" v-if="!showResults">
        <form @submit.prevent="search"  autocomplete="off">

            <div class="row noi-trip-type-container">
                <div class="col text-left">
                    <input  v-model="roundTripCheck" type="radio" name="roundTripCheck" value="1" placeholder="Round trip" /> Round trip
                    <input v-model="roundTripCheck" type="radio" name="roundTripCheck" value="0" placeholder="One way" /> One way
                </div>
            </div>

            <div class="row text-center">

                <div class="col-md-5">
                    <div class="row" style="position:relative;">
                        <div class="col-md-6">
                            <airports-dropdown 
                                @clicked="onDepartureAirportSelect" 
                                :initValue="departureAirport"
                                :clusters="sortedAirportsClusters" 
                                name="departureAirportPicker" 
                                :placeholder="$t('DepartureAirport')">
                            </airports-dropdown>
                        </div>
                        
                        <div class="noi-swap-icon" @click="swapAirports()">
                            <Icon icon="system-uicons:swap"/>
                        </div>
                        
                        <div class="col-md-6">
                            <airports-dropdown 
                                @clicked="onArrivalAirportSelect" 
                                :initValue="arrivalAirport"
                                :clusters="sortedAirportsClusters" 
                                name="arrivalAirportPicker" 
                                :placeholder="$t('DestinationAirport')">
                            </airports-dropdown>
                        </div>
                    </div>
                </div>

                <div class="col-md-7">
                    <div class="row">
                        <div class="col-md-4" >
                            <div style="position: relative;">
                                <!-- ref="datepicker" -->
                                <date-picker 
                                    :append-to-body="false"
                                    timeTitleFormat="MM"
                                    :editable="false"
                                    :confirm="false"
                                    @pick="handlePickDate"
                                    @open="handleOpenPopupEvent"
                                    @close="handleClosePopupEvent"
                                    :disabled-date="disabledRangeHandler"
                                    v-model="rangeDate" 
                                    format="DD MMM YY"
                                    valueType="date"
                                    range-separator=" - "
                                    key="1" 
                                    :input-attr="{class:'form-control noi-datepicker-input ',id:'rangeDatePicker',name:'rangeDatePicker'}"  
                                    :range="isRoundTrip"
                                >
                                </date-picker>
                                <!-- <div class="calendar-popup-container" :class="{range:isRoundTrip}">
                                    <div ref="target" style="position: relative;"></div>
                                </div> -->
                                <span class="noi-input-label" :class="{ focused: datePickerLabelFocused }">{{ $t("RangeDates") }}</span>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <passengers-dropdown 
                                @clicked="onPassengersSelect" 
                                name="departureAirportPicker" 
                                :placeholder="$t('Passengers')">
                            </passengers-dropdown>
                        </div>
    
                        <div class="col-md-4">
                            <input type="submit" class="button dark" value="Search flights" :class="{disabled: !isFormValid()}" />
                        </div>
                    </div>
                </div>
            </div>

        </form>
    </div>

    
    <!-- results container -->
    <div class="container px-4 noi-results" v-if="showResults">
        <div class="noi-results-loader" v-if="loadingResults">
            <div class="text-center">
                <div class="spinner-grow" role="status" style="width: 3rem; height: 3rem;">
                    <span class="visually-hidden">
                        {{ $t("Loading") }}...
                    </span>
                </div>
            </div>
        </div>
        <div v-else>

            <!-- top summary -->
            <div class="noi-results-top-summary">
                <div class="title">
                    <span>From {{ departureAirport.label }} to {{ arrivalAirport.label }}</span>
                    <div @click="changeSearch()" >
                        <Icon icon="prime:pencil"/>
                    </div>
                </div>
                <span class="subtitle">{{ getSearchSubtitle() }}</span> 
            </div>

            <!-- outward flights -->
            <div class="noi-results-flights">
                <div class="title">
                    <Icon icon="el:plane"/> <span>FLIGHT TO {{ arrivalAirport.label }}</span>
                </div>
                
                <!-- top calendar bar -->
                <div class="navigator">
                    <div class="container-flex">
                        <div class="horizontal-calendar">
                            <hooper 
                                ref="hooper"
                                :itemsToShow="7" 
                                :centerMode="true"
                                :wheelControl="false"
                                :initialSlide="this.getTimeInterval">
                                    <slide v-for="el in outwardCalendarElements" :key="el.key" class="horizontal-calendar-element" :class="{selected: isOutwardCalendarElementSelected(el)}">
                                        <div @click="handleOutwardCalendarElementClick(el)" >
                                            {{ getLowestAvailablePrice('outward',el.key) }}
                                            <span>{{ el.subLabel }}</span> 
                                        </div>
                                    </slide>
                                <hooper-navigation slot="hooper-addons" class="lg-only"></hooper-navigation>
                            </hooper>
                        </div>
                    </div>
                </div>

                <!-- results -->
                <div class="container-flex noi-flights-results-list" v-if="lastOutwardFlights.length > 0">
                    <div class="row noi-flights-results-row" v-for="flight in lastOutwardFlights" :key="flight.key" :class="flight.flightInfo['colorClass']" @click="evaluateMobileClick('outward',flight)"  >
                        
                        <!-- desktop -->
                        <div class="col-md-2 noi-flight-row-logo lg-only">
                            <img :src="require('@/assets/icons/skyalpsl-full-alt.png')" />
                            <br/>
                            <!-- <span>Operated by XXXXXX</span> -->
                        </div>
                        <div class="col-md-7 lg-only">
                            <div class="row">
                                <div class="col-md-3 noi-flight-row-airport departure">
                                    <div class="hour">{{ asZoneTime(flight.departure.time) }}</div>
                                    <div><div class="noi-flight-row-badge">{{ flight.departure.airport.iataCode }}</div> <span>{{ flight.departure.airport.name }}</span></div><br/>
                                </div>
                                <div class="col-md-6 noi-flight-row-path">
                                    <span>{{ getShownTime(flight) }}</span>
                                    <div class="noi-flight-row-plane-line" :class="flight.flightInfo['planeLineClass']">
                                        <div class="before"></div>
                                        <div class="plane">
                                            <Icon icon="material-symbols:flight" rotate="90deg" />
                                        </div>
                                        <div class="after"></div>
                                    </div>
                                    <span class="type">Direct</span>
                                </div>
                                <div class="col-md-3 noi-flight-row-airport arrival">
                                    <div class="hour">{{ asZoneTime(flight.arrival.time) }}</div>
                                    <div><div class="noi-flight-row-badge">{{ flight.arrival.airport.iataCode }}</div> <span>{{ flight.arrival.airport.name }}</span></div><br/>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3 noi-flight-row-button lg-only">
                            <div @click="selectFlight('outward',flight)" class="button" :class="{selected: selectedFlights['outward'] == flight}">
                                {{ getFormattedFlightRate(flight) }}
                            </div>
                        </div>


                        <!-- mobile -->
                        <div class="col sm-only">
                            <div class="noi-flight-row-airport"> From {{ flight.departure.airport.name }} to {{ flight.arrival.airport.name }}</div>
                            <div><span class="hour">{{ asZoneTime(flight.departure.time) }} - {{ asZoneTime(flight.arrival.time) }}</span></div>
                            <div class="noi-flight-row-status">
                                <span class="status" :class="flight.flightInfo['colorClass']">{{ $t(flight.flightInfo["text"]) }}</span>
                                <span class="message">Estimated arrival XX:YY</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-else>
                    <div class="noi-flights-any-result">
                        <p><strong>Sorry, no result on this date.</strong></p>
                        <p>There are no flights available, choose another date or <strong><u>restart the search</u></strong>.</p>
                    </div>
                </div>
            </div>

            <!-- return flights -->
            <div class="noi-results-flights" v-if="roundTripCheck == '1'">
                <div class="title">
                    <Icon icon="el:plane" rotate="180deg" /> <span>FLIGHT TO {{ departureAirport.label }}</span>
                </div>
                
                <!-- top calendar bar -->
                <div class="navigator">
                    <div class="container-flex">
                        <div class="horizontal-calendar">
                            <hooper 
                                ref="hooper"
                                :itemsToShow="7" 
                                :centerMode="true"
                                :wheelControl="false"
                                :initialSlide="this.getTimeInterval">
                                    <slide v-for="el in returnCalendarElements" :key="el.key"  class="horizontal-calendar-element day" :class="{selected: isReturnCalendarElementSelected(el)}">
                                        <div @click="handleReturnCalendarElementClick(el)" >
                                            {{ getLowestAvailablePrice('return',el.key) }} 
                                            <span>{{ el.subLabel }}</span>
                                        </div>
                                    </slide>
                                <hooper-navigation slot="hooper-addons" class="lg-only"></hooper-navigation>
                            </hooper>
                        </div>
                    </div>
                </div>


                <!-- results -->
                <div class="container-flex noi-flights-results-list" v-if="lastReturnFlights.length > 0">
                    <div class="row noi-flights-results-row" v-for="flight in lastReturnFlights" :key="flight.key" :class="flight.flightInfo['colorClass']" @click="evaluateMobileClick('return',flight)"  >
                        
                        <!-- desktop -->
                        <div class="col-md-2 noi-flight-row-logo lg-only">
                            <img :src="require('@/assets/icons/skyalpsl-full-alt.png')" />
                            <br/>
                            <!-- <span>Operated by XXXXXX</span> -->
                        </div>
                        <div class="col-md-7 lg-only">
                            <div class="row">
                                <div class="col-md-3 noi-flight-row-airport departure">
                                    <div class="hour">{{ asZoneTime(flight.departure.time) }}</div>
                                    <div><div class="noi-flight-row-badge">{{ flight.departure.airport.iataCode }}</div> <span>{{ flight.departure.airport.name }}</span></div><br/>
                                </div>
                                <div class="col-md-6 noi-flight-row-path">
                                    <span>{{ getShownTime(flight) }}</span>
                                    <div class="noi-flight-row-plane-line" :class="flight.flightInfo['planeLineClass']">
                                        <div class="before"></div>
                                        <div class="plane">
                                            <Icon icon="material-symbols:flight" rotate="90deg" />
                                        </div>
                                        <div class="after"></div>
                                    </div>
                                    <span class="type">Direct</span>
                                </div>
                                <div class="col-md-3 noi-flight-row-airport arrival">
                                    <div class="hour">{{ asZoneTime(flight.arrival.time) }}</div>
                                    <div><div class="noi-flight-row-badge">{{ flight.arrival.airport.iataCode }}</div> <span>{{ flight.arrival.airport.name }}</span></div><br/>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3 noi-flight-row-button lg-only">
                            <div @click="selectFlight('return',flight)" class="button" :class="{selected: selectedFlights['return'] == flight}">
                                {{ getFormattedFlightRate(flight) }}
                            </div>
                        </div>


                        <!-- mobile -->
                        <div class="col sm-only">
                            <div class="noi-flight-row-airport"> From {{ flight.departure.airport.name }} to {{ flight.arrival.airport.name }}</div>
                            <div><span class="hour">{{ asZoneTime(flight.departure.time) }} - {{ asZoneTime(flight.arrival.time) }}</span></div>
                            <div class="noi-flight-row-status">
                                <span class="status" :class="flight.flightInfo['colorClass']">{{ $t(flight.flightInfo["text"]) }}</span>
                                <span class="message">Estimated arrival XX:YY</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-else>
                    <div class="noi-flights-any-result">
                        <p><strong>Sorry, no result on this date.</strong></p>
                        <p>There are no flights available, choose another date or <strong><u>restart the search</u></strong>.</p>
                    </div>
                </div>

            </div>
        </div>
    </div>
    <div class="container-fluid noi-selection-bar" v-if="showResults" >
        <div class="container">
            <div class="row">
                <div class="col">
                    <div class="selection" :class="{selected: selectedFlights.outward}">
                        <div v-if="!selectedFlights.outward">Select the first flight</div>
                        <div v-else>
                            <div class="plane">
                                <Icon icon="el:plane" />
                            </div>
                            <div class="description">
                                <span class="title">From {{ selectedFlights.outward.departure.airport.name }} to {{ selectedFlights.outward.arrival.airport.name }}</span>
                                <span class="subtitle">{{ asZoneDate(selectedFlights.outward.departure.date,"UTC",selectedFlights.outward.departure.time,"EEE dd MMM")}}, {{asZoneTime(selectedFlights.outward.departure.time)}}, {{passengers.label}}</span>
                            </div>
                        </div>
                    </div>
                    <div class="selection" :class="{selected: selectedFlights.return}" v-if="isRoundTrip">
                        <div v-if="!selectedFlights.return">Select the second flight</div>
                        <div v-else>
                            <div class="plane">
                                <Icon icon="el:plane" rotate="180deg" />
                            </div>
                            <div class="description">
                                <span class="title">From {{ selectedFlights.return.departure.airport.name }} to {{ selectedFlights.return.arrival.airport.name }}</span>
                                <span class="subtitle">{{ asZoneDate(selectedFlights.return.departure.date,"UTC",selectedFlights.return.departure.time,"EEE dd MMM")}}, {{asZoneTime(selectedFlights.return.departure.time)}}, {{passengers.label}}</span>                                
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col">
                    <a  :href="selectedAirlineLink()" target="_blank" title="Skyalps Home">
                        <div class="button selected continue-button" :class="{disabled: (!selectedFlights.outward || (isRoundTrip && !selectedFlights.return))}">Continues <Icon v-if="!(!selectedFlights.outward || (isRoundTrip && !selectedFlights.return))" icon="mdi:arrow-up" rotate="90deg"></Icon></div>
                    </a>
                    <div class="price" v-if="selectedFlights.outward || selectedFlights.return">
                            Total {{ getTotalPrice }}    
                    </div>
                </div>
            </div>           
        </div>
    </div>

    <!-- footer -->
    <div class="footer" style="font-size: 80%; padding: 0.5rem 1.5rem">
        <a href="https://opendatahub.com" target="_blank">powered by Open Data Hub
            <img :src="require('@/assets/icons/odh.png')" height="25px" style="display: inline-block; margin-left: 10px" />
        </a>
    </div>


  </div>
</template>

<script>
import axios from "axios"
import { DateTime, Settings } from "luxon"
import Vue, { ref } from "vue"

import { Icon } from '@iconify/vue2';
    
import AirportsDropdown from './AirportsDropdown.vue';
import PassengersDropdown from './PassengersDropdown.vue';
    

import DatePicker from "vue2-datepicker";
// import "vue2-datepicker/index.css";

import {Hooper, Slide,Navigation as HooperNavigation} from 'hooper';


export default {
   components:{DatePicker,AirportsDropdown,PassengersDropdown,Hooper,HooperNavigation, Slide,Icon},
  name: "NoiFlightControl",
  //component props
  props: {
    options: Object,
    default: () => {
      return {
        from_ts: false,
        to_ts: false,
        airport: "BZO"
      }
    }
  },

  //components methods
  methods: {
    getSearchSubtitle(){
        let dpDate = DateTime.fromJSDate(this.rangeDate[0]).startOf('day');
        let str = dpDate.toFormat('dd')+" "+dpDate.toFormat('MMM')
        if(this.isRoundTrip){
            let rdDate = DateTime.fromJSDate(this.rangeDate[1]).startOf('day');
            str += " - "+rdDate.toFormat('dd')+" "+rdDate.toFormat('MMM')
        }
        str += ", "+this.passengers.label 
        return str;
    },
    getSelectedFlightSubtitle(flight){
        // let dpDate = DateTime.fromFormat(flight.date, "yyyy-LL-dd", "UTC").startOf('day');
        // let str = dpDate.toFormat('MMM')+" "+dpDate.toFormat('dd')+" "+dpDate.toFormat('MMM')
        let str = this.asZoneDate(flight.date)+" "+this.asZoneTime(flight.time);
        str += ", "+this.passengers.label 
        return str;
    },
    evaluateMobileClick(what,flight){
        if(this.device != 'desktop'){
            this.selectFlight(what,flight);
        }
    },
    selectFlight(what,flight){
        if(this.selectedFlights[what] == flight){
            this.selectedFlights[what] = null;
        }else{
            this.selectedFlights[what] = flight;
        }
    },
    changeSearch(){
        this.showResults = false;
        console.log("this.departureAirport",this.departureAirport)
        console.log("this.arrivalAirport",this.arrivalAirport)
    },
    isOutwardCalendarElementSelected(el){
        if(this.outwardFlightsSelectedDate == el.minDate.toFormat('yyyy-MM-dd')){
            return true;
        }

        return false;
    },
    isReturnCalendarElementSelected(el){
        if(this.returnFlightsSelectedDate == el.minDate.toFormat('yyyy-MM-dd')){
            return true;
        }

        return false;
    },
    handleOutwardCalendarElementClick(el){
        this.outwardFlightsSelectedDate = el.minDate.toFormat('yyyy-MM-dd');
    },
    handleReturnCalendarElementClick(el){
        this.returnFlightsSelectedDate = el.minDate.toFormat('yyyy-MM-dd');        
    },
    onDepartureAirportSelect(el){
        this.departureAirport = el;
        console.log("EXTERNAL departure HANDLER",'value: ' + el.value, ' label: ' + el.label);
    },
    onArrivalAirportSelect(el){
        this.arrivalAirport = el;
        console.log("EXTERNAL arrival HANDLER",'value: ' + el.value, ' label: ' + el.label);
    },
    onPassengersSelect(el){
        this.passengers = el;
        console.log("EXTERNAL passengers HANDLER",'value: ' + el.value, ' label: ' + el.label);
    },
    disabledRangeHandler: function(date){
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return date < d;
    },
    updateCalendarActiveSelectionClasses: function(){
        setTimeout(()=>{
            let els = this.$el.getElementsByClassName("active");
            if(els.length > 0){
                els[0].className += " first-active"; 
            }
        });
    },
    handlePickDate: function(){
            console.log("handlePickDate")
        this.updateCalendarActiveSelectionClasses()
    },
    handleOpenPopupEvent: function(){
        this.openedPopup = true;
        this.updateCalendarActiveSelectionClasses()
    },
    handleClosePopupEvent: function(){
        this.openedPopup = false;
    },
    dateFormat (classes, date) {
        if (!classes.disabled) {
          classes.disabled = date.getTime() < new Date()
        }
        return classes
      },

    loadMore(what) {
      this.max_entries[what] += this.options.maxforecast
    },
    selectedAirlineLink() {
        if(!this.selectedFlights.outward || (this.isRoundTrip && !this.selectedFlights.return)){
            return "";
        }

        // https://booking.skyalps.com/flight-results/FCO-VRN/2023-12-05/NA/2/0/0
        let outwardDate = DateTime.fromFormat(this.selectedFlights.outward.departure.date, "yyyy-LL-dd", "UTC").toFormat("yyyy-LL-dd")
        let airports = this.selectedFlights.outward.departure.airport.iataCode + "-" + this.selectedFlights.outward.arrival.airport.iataCode
        let passangersAdults = this.passengers.value.adults
        let passangersChildren = this.passengers.value.children
        let passangersInfant = 0;
        if(this.passengers.value.infants){
            passangersInfant = this.passengers.value.infants
        }
        
        let returnDate = "NA";
        if(this.isRoundTrip){
            // https://booking.skyalps.com/flight-results/FCO-VRN/2023-12-06/2023-12-08/2/0/0
            returnDate = DateTime.fromFormat(this.selectedFlights.return.departure.date, "yyyy-LL-dd", "UTC").toFormat("yyyy-LL-dd")
        }
       
        let link = "https://booking.skyalps.com/flight-results/" + airports + "/" + outwardDate + "/"+ returnDate +"/"+passangersAdults+"/"+passangersChildren+"/"+passangersInfant
        return link
    },
    asZoneTime(time = "00:00", source_zone = "UTC") {
        if (time == "") return ""
        let datetime = DateTime.fromFormat(time, "T", {
            zone: source_zone
        })
        datetime = datetime.setZone(this.current_timezone)
        return datetime.toFormat("HH:mm")
    },
    asZoneDate(date = "2022-01-01", source_zone = "UTC", time = "00:00",outputFormat = "EEE, dd MMM") {
        if (date == "") return ""
        let datetime = DateTime.fromFormat(date + " " + time, "yyyy-LL-dd T", {
            zone: source_zone
        })
        datetime = datetime.setZone(this.current_timezone)
        return datetime.toFormat(outputFormat)
    },
    updateTime() {
        let time = DateTime.utc()
        time = time.setZone(this.current_timezone)
        this.time = time
    },
    getShownTime(flight){
        let totalMinutesTime = Math.round((flight.arrival.timestamp-flight.departure.timestamp)/60);
        let string = "-";
        if(totalMinutesTime >= 60){
            let hours = Math.floor(totalMinutesTime/60);
            let minutes =  totalMinutesTime%60;
            string =  hours+"h "+minutes+"min";
        }else{
            string =  totalMinutesTime+"min";
        }
        return string;
    },

    // resolve a message request
    $t: function (messageKey, fallbackMessage) {
        let els = messageKey.split(".");
        let langPack = this.currentLangPack
        for (var i = 0; i < els.length; i++) {
            var key = els[i];
            langPack = langPack[key];

            if (langPack === undefined) {
                if (fallbackMessage) {
                    return fallbackMessage;
                } else {
                    return "[" + messageKey + "]";
                }
            }
        }
        return langPack;
    },

    validateForm(){
        let roundTripCheck = this.roundTripCheck;
        let departureAirport = this.departureAirport;
        let arrivalAirport = this.arrivalAirport;
        let rangeDate = this.rangeDate;

        let errors = []
        if (!departureAirport || !departureAirport.value) {
            errors.push({
                "message":this.$t("errors.departureAirport.empty")
            })
        }
        if (!arrivalAirport || !arrivalAirport.value) {
            errors.push({
                "message":this.$t("errors.arrivalAirport.empty")
            })
        }

        if(roundTripCheck == "1"){
            if(!rangeDate){
                errors.push({
                    "message":this.$t("errors.departureDate.empty")
                })
                errors.push({
                    "message":this.$t("errors.returnDate.empty")
                })
            }else{
                if(!rangeDate[0]){
                    errors.push({
                        "message":this.$t("errors.departureDate.empty")
                    })
                }
                if(!rangeDate[1]){
                    errors.push({
                        "message":this.$t("errors.returnDate.empty")
                    })
                }
            }
        }else{
            if(!rangeDate){
                errors.push({
                    "message":this.$t("errors.departureDate.empty")
                })
            }
        }

        if(errors.length > 0){
            return {
                result:false,
                errors:errors
            }
        }else{
            return {
                result:true,
                data:{
                    roundTripCheck:roundTripCheck,
                    departureAirport:departureAirport,
                    arrivalAirport:arrivalAirport,
                    rangeDate:rangeDate
                }
            }
        }
    },

    isFormValid: function(){
        let formValidationResponse = this.validateForm();
        if(formValidationResponse.result == false){
            return false;
        }
        return true;
    },

    async search(){
        //form validation
        let formValidationResponse = this.validateForm();
        if(formValidationResponse.result == false){
            let validatedFormErrors = formValidationResponse.errors;
            console.log("validatedFormErrors",validatedFormErrors)
            return false;
        }
        let validatedFormData = formValidationResponse.data;
        console.log("validatedFormData",validatedFormData)

        this.updateTime()
        this.loadingResults = true;
        this.showResults = true;

        await this.fetchSchedules(validatedFormData);

        this.loadingResults = false;
    },
    swapAirports: function(){
        let toAirport = this.arrivalAirport
        this.arrivalAirport = this.departureAirport
        this.departureAirport = toAirport
    },  
    addWhereCondition: function(where,condition){
        if(where != ""){
            where += ","
        }
        return where += condition;
    },  
    parseData: function(data){
        let parsedData = {};
        for(let i = 0; i< data.data.data.length; i++){
            let o = data.data.data[i];
            let datetime = DateTime.fromFormat(o.smetadata.fltsfromperiod + " " + o.smetadata.std, "yyyy-LL-dd T",{ zone: "UTC" })

            let rate = o.smetadata.fares ? o.smetadata.fares["SKY_LIGHT"] : null

            if (rate) {
            rate =
                rate.fare.adultFareOW +
                rate.fare.tax1OW +
                rate.fare.tax2OW +
                rate.fare.tax3OW +
                rate.fare.tax4OW
            }

            if (isNaN(rate) || rate == 0) rate = false

            //check for airports map
            if(!this.airports[o.smetadata.fromdestination]){
                console.log("Error: any departure airport named '"+o.smetadata.fromdestination+"' has been found in mapping.")
            }
            if(!this.airports[o.smetadata.todestination]){
                console.log("Error: any arrival airport named '"+o.smetadata.todestination+"' has been found in mapping.")
            }

            let obj = {
                departure:{
                    date:o.smetadata.fltsfromperiod.replace(/\//g, "-"),
                    time:o.smetadata.std,
                    timestamp:o.smetadata.departure_timestamp,
                    airport:{
                        iataCode:o.smetadata.fromdestination,
                        name:this.airports[o.smetadata.fromdestination].name,
                        coordinates:this.airports[o.smetadata.fromdestination].pos
                    }
                },
                arrival:{
                    date:o.smetadata.fltstoperiod.replace(/\//g, "-"),
                    time:o.smetadata.sta,
                    timestamp:o.smetadata.arrival_timestamp,
                    airport:{
                        iataCode:o.smetadata.todestination,
                        name:this.airports[o.smetadata.todestination].name,
                        coordinates:this.airports[o.smetadata.todestination].pos
                    }
                },
                status: o.smetadata.remark ? o.smetadata.remark : "SCHEDULED",
                company: o.sorigin,
                rates: rate ? { basic_adult_oneway_withtaxes: rate } : null
            }

            let flightInfo = this.getFlightInfo(obj);
            obj.flightInfo = flightInfo;

            let k = obj.departure.date;
            if(!parsedData[k]){
                parsedData[k] = [];
            }
            parsedData[k].push(obj)
        }

        // sort by timestamps
        for(let k in parsedData){
            parsedData[k].sort(this.sortByTimestamp)
        }
        return parsedData
    },
    async getData(whereCondition){
        //compile get parameters
        let params = {
            limit: "-1",
            offset: "0",
            shownull: "false",
            distinct: "true",
            where: whereCondition,
            origin: "webcomp-flightdata"
        }
        params = new URLSearchParams(params).toString()
        
        //make request
        let data = await axios.get(this.options.rest_endpoint + params)
        // console.log("getData",params,data)
        return data;
    },
    async fetchSchedules(searchData) {
        try {

            // getting outward flights
            //adding where conditions
            let where = ""
            if(searchData.departureAirport && searchData.departureAirport.value){
                let els = searchData.departureAirport.value.split("|");
                let airportOrCondition = "";
                if(els.length > 1){
                    airportOrCondition += "or("
                    for(let i = 0; i<els.length; i++){
                        if(i > 0){
                            airportOrCondition += ","
                        }
                        airportOrCondition += "smetadata.fromdestination.eq."+els[i]
                    }
                    airportOrCondition += ")"
                }else{
                    airportOrCondition = "smetadata.fromdestination.eq."+searchData.departureAirport.value+"";
                }
                where = this.addWhereCondition(where,airportOrCondition);
            }
            if(searchData.arrivalAirport){
                let els = searchData.arrivalAirport.value.split("|");
                let airportOrCondition = "";
                if(els.length > 1){
                    airportOrCondition += "or("
                    for(let i = 0; i<els.length; i++){
                        if(i > 0){
                            airportOrCondition += ","
                        }
                        airportOrCondition += "smetadata.todestination.eq."+els[i]
                    }
                    airportOrCondition += ")"
                }else{
                    airportOrCondition = "smetadata.todestination.eq."+searchData.arrivalAirport.value+"";
                }
                where = this.addWhereCondition(where,airportOrCondition);
            }

            // handle dates
            let departureDate = null;
            let returnDate = null;
            if(searchData.roundTripCheck == "1"){
                if(searchData.rangeDate){
                    if(searchData.rangeDate[0]){
                        departureDate = searchData.rangeDate[0];
                    }
                    if(searchData.rangeDate[1]){
                        returnDate = searchData.rangeDate[1];
                    }
                }
            }else{
                departureDate = searchData.rangeDate;
            }

            if(departureDate){

                let centerDate = DateTime.fromJSDate(departureDate).startOf('day');
                this.outwardFlightsSelectedDate = centerDate.toFormat('yyyy-MM-dd');

                let departureDateLower = centerDate.minus({ days: Math.round(this.clusterNumber/2)-1 });
                let departureDateUpper = centerDate.plus({ days: Math.round(this.clusterNumber/2) });
                where = this.addWhereCondition(where,"smetadata.departure_timestamp.gt."+departureDateLower.toMillis()/1000);
                where = this.addWhereCondition(where,"smetadata.departure_timestamp.lt."+departureDateUpper.toMillis()/1000);
            }else{
                let now = new Date();
                where = this.addWhereCondition(where,"smetadata.departure_timestamp.gt."+now.getTime()/1000);
            }
            where = "and("+where+")"

            let data = await this.getData(where);

            //parse received data
            this.outwardFlights = this.parseData(data)


            //getting return flights
            if(searchData.roundTripCheck == "1"){
                //adding where conditions
                where = ""

                if(searchData.departureAirport && searchData.departureAirport.value){
                    let els = searchData.departureAirport.value.split("|");
                    let airportOrCondition = "";
                    if(els.length > 1){
                        airportOrCondition += "or("
                        for(let i = 0; i<els.length; i++){
                            if(i > 0){
                                airportOrCondition += ","
                            }
                            airportOrCondition += "smetadata.todestination.eq."+els[i]
                        }
                        airportOrCondition += ")"
                    }else{
                        airportOrCondition = "smetadata.todestination.eq."+searchData.departureAirport.value+"";
                    }
                    where = this.addWhereCondition(where,airportOrCondition);
                }
                if(searchData.arrivalAirport){
                    let els = searchData.arrivalAirport.value.split("|");
                    let airportOrCondition = "";
                    if(els.length > 1){
                        airportOrCondition += "or("
                        for(let i = 0; i<els.length; i++){
                            if(i > 0){
                                airportOrCondition += ","
                            }
                            airportOrCondition += "smetadata.fromdestination.eq."+els[i]
                        }
                        airportOrCondition += ")"
                    }else{
                        airportOrCondition = "smetadata.fromdestination.eq."+searchData.arrivalAirport.value+"";
                    }
                    where = this.addWhereCondition(where,airportOrCondition);
                }

                if(returnDate){
                    let centerDate = DateTime.fromJSDate(returnDate).startOf('day');
                    this.returnFlightsSelectedDate = centerDate.toFormat('yyyy-MM-dd');
                    let returnDateLower = centerDate.minus({ days: Math.round(this.clusterNumber/2)-1 });
                    let returnDateUpper = centerDate.plus({ days: Math.round(this.clusterNumber/2) });
                    where = this.addWhereCondition(where,"smetadata.departure_timestamp.gt."+returnDateLower.toMillis()/1000);
                    where = this.addWhereCondition(where,"smetadata.departure_timestamp.lt."+returnDateUpper.toMillis()/1000);
                }else{
                    let now = new Date();
                    where = this.addWhereCondition(where,"smetadata.departure_timestamp.gt."+now.getTime()/1000);
                }
                where = "and("+where+")"

                data = await this.getData(where);

                //parse received data
                this.returnFlights = this.parseData(data)
            }

        } catch (error) {
            console.error(error)
        }
    },
    sortByTimestamp: function (a, b) {
        if (a.timestamp < b.timestamp) {
            return -1
        }
        if (a.timestamp > b.timestamp) {
            return 1
        }
        return 0
    },
    sortByDateTime: function (a, b) {
        const adate = a.departure.date + "/" + a.departure.time
        const bdate = b.departure.date + "/" + b.departure.time
        let adatetime = DateTime.fromFormat(adate, "yyyy-LL-dd/H:mm", {zone: "UTC"})
        let bdatetime = DateTime.fromFormat(bdate, "yyyy-LL-dd/H:mm", {zone: "UTC"})

        if (adatetime < bdatetime) {
            return -1
        }
        if (adatetime > bdatetime) {
            return 1
        }
        return 0
    },
    
    handleViewportResize: function () {
        setTimeout(()=>{
            const wi = this.$refs.viewport.clientWidth
            this.device = "desktop"
            if (wi < 768) this.device = "tablet"
            if (wi < 480) this.device = "smartphone"
      
            // console.log("wi",wi)
            // console.log("wi",wi)
            // console.log("wi",wi)
            // console.log("this.device",this.device)
        })
    },
    getFormattedFlightRate(flight){
        if(flight.rates && flight.rates.basic_adult_oneway_withtaxes){
            return this.formatEuro(flight.rates.basic_adult_oneway_withtaxes);
        }else{
            return "-";
        }
    },
    getFlightInfo(data) {
        let arrivalDate = DateTime.fromMillis(data.sta * 1000, {zone: this.current_timezone})
        let departureDate = DateTime.fromMillis(data.std * 1000, {zone: this.current_timezone})
        const arrival_diff = arrivalDate.diff(this.time, ["minutes"]).toObject()["minutes"]
        const departure_diff = departureDate.diff(this.time, ["minutes"]).toObject()["minutes"]

        // landed
        if (arrival_diff < 0) {
            return {
                text: "LANDED",
                planeLineClass:"end",
                colorClass: "gray"
            }
        }

        // in flight
        if (arrival_diff > 0 && departure_diff < 0) {
            return {
                text: "IN_FLIGHT",
                planeLineClass:"middle",
                colorClass: "green"
            }
        }
        
        // boarding => departure - 30m
        if (departure_diff < 30) {
            return {
                text: "BOARDING",
                planeLineClass:"start",
                colorClass: "green"
            }
        }

        // scheduled
        if (departure_diff > 0) {
            return {
                text: "SCHEDULED",
                planeLineClass:"start",
                colorClass: "gray"
            }
        }

        // TODO: realtime data endpoints not ready yet
        // ontime
        // delayed
        // cancelled


        // return {
        //     text: "ON TIME",
        //     planeLineClass:"start",
        //     colorClass: "green"
        // }
        
        // return {
        //     text: "DELAYED",
        //     planeLineClass:"start",
        //     colorClass: "yellow"
        // }

        // return {
        //     text: "CANCELLED",
        //     planeLineClass:"start",
        //     colorClass: "red"
        // }

        return {
            text: "",
            planeLineClass:"start",
            colorClass: "yellow"
        }
    },
    getCalendarElements(what){
        let centerDate = DateTime.now().startOf('day');
        if(this.roundTripCheck == "1"){
            if(this.rangeDate && this.rangeDate[what]){
                centerDate = DateTime.fromJSDate(this.rangeDate[what]).startOf('day');
            }
        }else{
            if(this.rangeDate){
                centerDate = DateTime.fromJSDate(this.rangeDate).startOf('day');
            }
        }

        let els = []
        for(let i = -Math.round(this.clusterNumber/2)+1; i<Math.round(this.clusterNumber/2); i++){
            let minDate = centerDate.plus({ days: 1*i });
            let maxDate = minDate.plus({ days: 0 });
            let k = minDate.toFormat('yyyy')+"-"+minDate.toFormat('MM')+"-"+minDate.toFormat('dd')
            let el = {
                key:k,
                subLabel:minDate.toFormat('dd')+" "+minDate.toFormat('MMM'),
                minDate:minDate,
                maxDate:maxDate
            }
            els.push(el)
        }
        
        return els;
    },
    formatEuro(val){
        return val.toFixed(2).replace(".",",")+" €"
    },
    getLowestAvailablePrice(what,key){
        if(what == 'outward'){
            if(this.outwardFlights && this.outwardFlights[key]){
                const min = Math.min(...this.outwardFlights[key].filter((item) => (item.rates && item.rates.basic_adult_oneway_withtaxes)).map((item) => {
                    return item.rates.basic_adult_oneway_withtaxes
                }))
                if(min == null || min == Infinity){
                    if(this.outwardFlights[key].length === 0){
                        return "-";
                    }else{
                        return "NA";
                    }
                }else{
                    return this.formatEuro(min);
                }
            }
        }else if(what == 'return'){
            if(this.returnFlights && this.returnFlights[key]){
                const min = Math.min(...this.returnFlights[key].filter((item) => (item.rates && item.rates.basic_adult_oneway_withtaxes)).map((item) => {
                    return item.rates.basic_adult_oneway_withtaxes
                }))
                if(min == null || min == Infinity){
                    if(this.returnFlights[key].length === 0){
                        return "-";
                    }else{
                        return "NA";
                    }
                }else{
                    return this.formatEuro(min);
                }
            }
        }
        
        return "-";
    }
  },

  //computed calculations
  computed: {
    getTotalPrice(){
        let total = 0;
        if(this.selectedFlights.outward && this.selectedFlights.outward.rates && this.selectedFlights.outward.rates.basic_adult_oneway_withtaxes){
            total += this.selectedFlights.outward.rates.basic_adult_oneway_withtaxes;
        }
        if(this.selectedFlights.return && this.selectedFlights.return.rates && this.selectedFlights.return.rates.basic_adult_oneway_withtaxes){
            total += this.selectedFlights.return.rates.basic_adult_oneway_withtaxes;
        }
        
        return this.formatEuro(total);
    },
    getTimeInterval(){
        if(this.selectedTimeIntervalIndex){
            return this.selectedTimeIntervalIndex;
        }
        
        return this.getDefaultTimeInterval;
    },
    getDefaultTimeInterval(){        
        if(!this.clusterNumber){
            return 0;
        }

        return Math.round(this.clusterNumber/2)+1;
    },
    outwardCalendarElements(){
        let els = this.getCalendarElements(0);
        return els;
    },
    returnCalendarElements(){
        let els = this.getCalendarElements(1);
        return els;
    },
    datePickerLabelFocused(){
        if(this.openedPopup || 
            (this.isRoundTrip && (this.rangeDate && this.rangeDate.length == 2 &&  this.rangeDate[0] != null  && this.rangeDate[0] != "")) || 
            (!this.isRoundTrip && (this.rangeDate != null && this.rangeDate != ""))){
            return true;
        }

        return false;
    },  
    isRoundTrip() {
      return (this.roundTripCheck == 1); 
    },
    hasOutwardFlights() {
        if(this.outwardFlights){
            return (this.outwardFlights[this.outwardFlightsSelectedDate].length > 0); 
        }
        return false;
    },
    hasReturnFlights() {
        if(this.returnFlights){
            return (this.returnFlights[this.returnFlightsSelectedDate].length > 0); 
        }
        return false;
    },
    lastOutwardFlights() {
        // console.log("outward last flights",this.outwardFlightsSelectedDate)
        // console.log(this.outwardFlights)
        let els = []
        if(this.outwardFlights && this.outwardFlights[this.outwardFlightsSelectedDate]){
            els = this.outwardFlights[this.outwardFlightsSelectedDate].slice(0, this.max_entries.return)
        }
        // console.log("els",els)
        return els
    },
    lastReturnFlights() {
        // console.log("return last flights",this.returnFlightsSelectedDate)
        // console.log(this.returnFlights)
        let els = []
        if(this.returnFlights && this.returnFlights[this.returnFlightsSelectedDate]){
            els = this.returnFlights[this.returnFlightsSelectedDate].slice(0, this.max_entries.return)
        }
        // console.log("els",els)
        return els
    },
    sortedAirports() {
        let sortedAirports = []
        Object.keys(this.airports).map((key)=>{
            let o = this.airports[key];
            o.key = key
            sortedAirports.push(o)
        });
        
        sortedAirports = sortedAirports.sort((a,b)=>{
            if(a.name<b.name) return -1;
            if(b.name<a.name) return 1;
            else return 0;
        })
        return sortedAirports;
    },
    sortedAirportsClusters() {
        let sortedAirportsClusters = []
        this.airportsClusters.sort((a,b)=>{
            if(a.name<b.name) return -1;
            if(b.name<a.name) return 1;
            else return 0;
        }).map((el)=>{
            let o = {
                label:el.name+' (All)',
                value:el.airports.join('|'),
                airports:[]
            }

            o.airports = el.airports.sort((a,b)=>{
                if(a.name<b.name) return -1;
                if(b.name<a.name) return 1;
                else return 0;
            }).map((airportKey)=>{
                return {
                    value:airportKey,
                    label:this.airports[airportKey].name
                };
            });

            sortedAirportsClusters.push(o)
        });
        
        // sortedAirports = sortedAirports.sort((a,b)=>{
        //     if(a.name<b.name) return -1;
        //     if(b.name<a.name) return 1;
        //     else return 0;
        // })
        return sortedAirportsClusters;
    }
  },

  //on mount component
  mounted: function () {
    // init datetime picker
    // const el = this.$refs.datepicker.$refs.popup.$el;
    // this.$refs.target.appendChild(el);
      
    //init current language
    this.currentLanguage = "en";
    // console.log("this.options",this.options)
    // console.log("this.options.language",this.options.language)
    if(this.options.language){
        this.currentLanguage = this.options.language;
    }
    
    //init current langPack
    let fullLangPack = require("../mappings/languages.json");
    if (this.options.langPack){
        fullLangPack = { ...fullLangPack, ...this.options.langPack }
    }
    if(fullLangPack[this.currentLanguage]){
        this.currentLangPack = fullLangPack[this.currentLanguage]
    }else{
        this.currentLangPack = fullLangPack['en']
    }

    //init periods
    this.selectedTimeIntervalIndex = this.getDefaultTimeInterval;

    Settings.defaultLocale = this.currentLanguage

    //init timezone
    this.current_timezone = this.options.timezone
    
    //init units as metric
    if (this.options.metricUnits) {
      this.units = {
        speed: "km/h",
        alt: "m"
      }
    }
    
    this.roundTripCheck = 1;

    //run resize event
    this.handleViewportResize()

    // this.search(); //DEV: to be removed
  },
  //component whatcers
  watch: {
    "roundTripCheck": function () {
        this.rangeDate = null;
    }
  },

  //on component has been created
  created: async function () {
    
    this.updateTime()
    this.time = this.time.setZone(this.current_timezone)

    // "container"-queries
    window.addEventListener("resize", this.handleViewportResize)

    this.max_entries.outward = this.options.maxforecast
    this.max_entries.return = this.options.maxforecast

  },
  destroyed() {
    window.removeEventListener("resize", this.handleViewportResize)
  },
  data() {
      return {
        clusterNumber:31,
        users: [
            {
                id: 1,
                name: 'John'
            },
            {
                id: 2,
                name: 'Paul'
            },
            {
                id: 3,
                name: 'George'
            },
            {
                id: 4,
                name: 'Ringo'
            },
        ],
        openedPopup:false,
        rangeDate:ref(),
        roundTripCheck:ref(),
        
        //DEV: to be removed
        departureAirport:{value:'BZO|CAG|FCO|VRN|OLB|SUF|CRV|CTA|BDS|BGY|CUF',label:"Italy (All)"},
        arrivalAirport:{value:'BZO|CAG|FCO|VRN|OLB|SUF|CRV|CTA|BDS|BGY|CUF',label:"Italy (All)"},
        // departureAirport:{value:'BZO',label:"Bolzano"},
        // arrivalAirport:{value:'BWK|DUS|HAM|KSF|BER',label:"Germany"},
        // departureAirport:ref(),
        // arrivalAirport:ref(),
        
        passengers:{value:{adults:1,children:0},label:"1 adult"},
        zoneindex: 1,
        device: "desktop",
        showResults: false,
        loadingResults: false,
        current_timezone: "",
        selectedFlights:{
            outward:null,
            return:null
        },
        outwardFlightsSelectedIndex:0,
        returnFlightsSelectedIndex:0,
        outwardFlightsSelectedDate:null,
        returnFlightsSelectedDate:null,
        outwardFlights: {},
        returnFlights: {},
        time: "00:00:00 UTC",
        currentLangPack:{},
        units: {
            speed: "kts",
            alt: "ft"
        },
        max_entries: {
            outward:5,
            return:5
        },
        airports: require("../mappings/airports.js"),
        airportsClusters: require("../mappings/airportsClusters.js")
    }
  }
}
</script>

<style lang="scss">
@import "~bootstrap/scss/bootstrap.scss";
@import "~vuelayers/dist/vuelayers.min.css";
// @import "~vue2-datepicker/index.css";

@import "../css/hooper.css";
@import "../css/vue2-datepicker.css";

.noi-flightdata-booking {

    font-family: var(--noi-font-family, Verdana);
    font-size: var(--basic-font-size, 10px);
    color: var(--noi-text-primary, #000000);
    background-color: white;;

    a {
        text-decoration: none;
        color: var(--noi-text-primary, #0068b4);
    }

    h1,h2,h3,h4,h5,h6 {
        color: var(--noi-text-primary, #000000);
    }

    h1 {
        font-size: 3rem;
    }

    h2 {
        font-size: 1.875rem;
        font-weight: bold;
        line-height: 2.5rem;
        margin-bottom: 0.125rem;
        padding-top: 0.25rem;
        
        .iconbg {
            display: inline-block;
            background: black;
            border-radius: 5px;
            padding: 4px;
        }
    }

    h3 {
        font-size: 2rem;
        background:#6e6e6d;
    }


    &.skyalps {
        --noi-primary: #a1bad4;
        --noi-mid: #a1bad4;
        --noi-secondary: #004988;
        --noi-text-primary: black;
        --noi-text-secondary: white;
        
        --noi-text-blue: #004988;
        .button{
            color: var(--noi-text-blue, #004988);
        }

        .noi-search-fields-container{
            .noi-swap-icon{
                color: var(--noi-text-blue, #004988);
            }

            
            .mx-datepicker{
                .mx-table-date .today{
                    color: var(--noi-text-blue, #4b74aa);
                }
                .mx-calendar-header-label {
                    color: var(--noi-text-blue, #4b74aa);
                }
                .mx-btn{
                    &.mx-btn-text{
                        color: var(--noi-text-blue, #4b74aa);
                    }
                }
                .mx-calendar-content .cell.active:before,
                .mx-calendar-content .cell.active.first-active:before,
                .mx-calendar-content .cell.in-range,
                .mx-calendar-content .cell.hover-in-range,
                .mx-calendar-week-mode .mx-date-row.mx-active-week{
                    background-color: #cbd2e7;
                }
            }
        }
        .noi-results{
            .noi-results-top-summary{
                .title{
                    span, svg{
                        color: var(--noi-text-blue, #004988);
                    }
                }
            }
            .noi-results-flights{
                .title{
                    color: var(--noi-text-blue, #004988);
                }
                .navigator{
                    color: white;
                    .horizontal-calendar{
                        .hooper-navigation{
                            fill:white;
                        }
                    }
                }
            }
        }
        .noi-selection-bar{
            .selection{
                color: var(--noi-text-blue, #004988);
                .description{
                    .subtitle{
                        color: black;
                    }
                }
            }
            .price{
                color: var(--noi-text-blue, #004988);
            }
        }

    }

    .dark {
        img {
            -webkit-filter: invert(1);
            filter: invert(1);
        }
    }


    .load-more {
        cursor: pointer;

        td {
            color: black !important;
            background-color: var(--noi-jam-strong, #e4c200) !important;
        }
    }

    .sm-only {
        display: none;
    }
    .lg-only {
        display: block;
    }

    
    /* MOBILE */
    &.smartphone, &.tablet {
        .sm-only {
            display: block;
        }
        .lg-only {
            display: none;
        }
    }


    // eleemnts
    .noi-top-bar{
        background-color: #F5F4F6;
        text-align: center;

        img{
            margin: 0.25rem;
            width: auto;
            height: 3rem;
        }
    }
    .noi-description-bar{
        text-align: center;
        padding: 1rem;
        p{
            font-size: 1.125rem;
        }
    }


    .noi-search-fields-container {
        color: var(--noi-text-primary, #000000);
        width: 100%;
        // max-width: 1500px;
        background-color: #ffffff;
        margin-bottom: 2rem;

        .col{
            padding:0 0.625rem;
        }

        input{
            border: 1px solid var(--noi-light-bg, #F5F4F6);
        }

        .noi-trip-type-container{
            margin-bottom: 1rem;

            input:nth-child(2){
                margin-left: 1rem;
            }
        }

        .mx-datepicker{
            .mx-datepicker-main{
                &.mx-datepicker-popup{
                    left: -0.5rem;
                    top: 4.6rem;
                }
            } 
            &.mx-datepicker-range{
                .mx-datepicker-main{
                    &.mx-datepicker-popup{
                        left: calc(-50% + 0.5rem);
                    }
                } 
            }

            .mx-calendar-content{
                .cell.active{
                    background-color: var(--noi-secondary, black);
                    color:white;
                    :before{
                       background-color: var(--noi-secondary, #f5f5f5);
                    }
                }
                
            }
            .mx-table-date .today{
                color:black;
            }
            .mx-calendar-header-label {
                color:black;
            }
            .mx-btn{
                &.mx-btn-text{
                    color:black;
                    font-weight: bold;
                    font-size: 0.8rem;
                }
            }
            .mx-calendar-content .cell.active:before,
            .mx-calendar-content .cell.active.first-active:before,
            .mx-calendar-content .cell.in-range,
            .mx-calendar-content .cell.hover-in-range,
            .mx-calendar-week-mode .mx-date-row.mx-active-week{
                background-color: #f5f5f5;
            }
        }
        
        .noi-swap-icon{
            position: absolute;
            top:0.6rem;
            left:calc(50% - 1.15rem);
            width: 2.3rem;
            height: 2.3rem;
            border-radius: 1.15rem;
            text-align: center;
            z-index: 90;
            background-color: white;
            border: 1px solid var(--noi-light-bg, #F5F4F6);;
            margin: 0;
            padding-top: 0.3rem;
            padding-left: 0.55rem;
            font-size: 1.2rem;
            font-weight: bold;
            cursor: pointer;
        }
    
    }

    .noi-results {
        color:var(--noi-text-primary, black);
        width: 100%;
        background-color: #ffffff;
        color: white;
        height: 80%;
        margin: 2rem auto;
        overflow-y: auto; 
        overflow-x: hidden; 

        .noi-results-top-summary{
            .title{
                span{
                    display: inline;
                    font-size: 1.25rem;
                }
                div{
                    display: inline;
                    cursor: pointer;
                    margin: 0 0 0 0.5rem;
                }
                display: block;
                color:var(--noi-text-primary, black);
                font-weight: bold;
                font-size: 1.5rem;
            }
            span.subtitle{
                display: block;
                color:var(--noi-text-primary, black);
                font-size: 0.875rem;
            }
        }
        .noi-results-flights{
            margin: 2.5rem 0 0 0;
            color:var(--noi-text-primary, black);
            
            .title{
                font-size: 1.125rem;
                font-weight:bold;
                color:var(--noi-text-primary, black);
                width: 100%;
                display: block;
                margin-bottom: 0.5rem;

                span{
                    text-transform: uppercase;
                }
            }
            .navigator{
                height: 4rem;
                margin: 0;
                color: var(--noi-text-primary, black);
                background-color: var(--noi-mid, #f5f5f5);

                .horizontal-calendar{
                    width:100%;

                    .horizontal-calendar-element{
                        height: 4rem;
                        width: min-content;
                        padding: 0.53rem 1rem;
                        text-align: center;
                        font-weight: bold;
                        font-size: 1.3rem;
                        cursor: pointer;
                        
                        &:hover, &.selected{
                            color:var(--noi-text-secondary,white);
                            background-color: var(--noi-secondary, black);
                        }
                        
                        span{
                            font-weight: normal;
                            font-size: 0.9rem;
                            display: block;
                        }
                    }
                }
            }

            .noi-flights-any-result{
                margin-top: 2rem;
                text-align: center;
                color:var(--noi-text-primary,black);
            }

            .noi-flights-results-list{
                max-height: 330px;
                overflow-x: hidden;
                overflow-y: auto;

                .noi-flights-results-row{
                    text-align: center;
                    color: #000000;
                    padding: 1rem 0;
                    margin:0 2rem;
                    vertical-align: middle;
                    border-bottom:1px solid #f5f5f5;

                    .green{
                        color: green;
                    }
                    .gray{
                        color: gray;
                    }
                    .yellow{
                        color:gold;
                    }
                    .red{
                        color: red;
                    }

                    .noi-flight-row-status-badge{
                        text-align: left;
                        font-size: 2rem;
                    }
                    .noi-flight-row-logo{
                        img{
                            max-width: 110px;
                            margin-top: 1rem;
                        }
                        span{   
                            font-weight: bold;
                            font-size: 0.9rem;
                        }
                    }
                    .noi-flight-row-airport{
                        margin-top:0.5rem;
                        
                        span,div{
                            font-weight: bold;
                            &.hour{
                                display: block;
                                padding-bottom: 0.5rem;
                            }
                        }

                        div{
                            display: inline-block;
                        }

                        div.noi-flight-row-badge{
                            background-color: #f5f5f5;
                            border-radius: 0.25rem;
                            width: 2rem;
                            height: 1.3125rem;
                            font-size: 0.725rem;
                            padding-top: 0.2rem;
                            font-weight: bold;
                        }

                        &.departure{
                            
                        }
                        &.arrival{

                        }

                    }
                    .noi-flight-row-path{
                        // min-width: 20rem;

                        .noi-flight-row-plane-line{
                            margin: 1rem 0;
                            position: relative;

                            div.before,div.after{
                                height: 0.125rem;
                                position: absolute;
                                padding:0;
                                margin: 0;
                            }

                            div.before{
                                border-top:0.125rem solid var(--noi-secondary, black);
                                // width: calc(50% - 0.75rem);
                            }
                            div.plane{
                                font-size: 1.5rem;
                                background: white;
                                padding: 0 0.25rem;
                                margin: -0.9rem 0;
                                position: absolute;
                                width: 2rem;
                                color:var(--noi-secondary, black);
                                z-index: 2;
                                background-color: white;
                                line-height: 1.5rem;
                            }
                            div.after{
                                border-top:0.125rem solid var(--noi-mid, #f5f5f5);
                                // width: calc(50% - 0.75rem);
                            }

                            &.start{
                                div.before{
                                    width: 0;
                                }
                                div.plane{
                                    left:0;
                                }
                                div.after{
                                    width: calc(100% - 0.75rem);
                                    left:0.75;
                                }
                            }
                            &.middle{
                                div.before{
                                    width: calc(50% - 0.75rem);
                                    left:0;
                                }
                                div.plane{
                                    left:calc(50% - 2rem);
                                }
                                div.after{
                                    width: calc(50% - 0.75rem);
                                    left:50%;
                                }
                            }
                            &.end{
                                div.before{
                                    width: calc(100% - 0.75rem);
                                    left:0;
                                }
                                div.plane{
                                    left:calc(100% - 2rem);
                                }
                                div.after{
                                    width: 0;
                                }
                            }
                        }
                        span{
                            font-weight: bold;
                            font-size: 0.9rem;
                            position: relative;
                            top:0.5rem;
                        }
                        span.type{
                            color:#6e6e6d;
                        }
                    }
                    .noi-flight-row-flight-number{
                        font-weight: bold;
                        padding-top: 0.75rem;
                    }
                    .noi-flight-row-status{
                        font-weight: bold;

                        .status{
                            font-size: 1.2rem;

                        }
                        .details{
                            font-size: 0.7rem;
                            position: relative;
                            top: -0.375rem;
                        }
                    }
                    .noi-flight-row-button{
                        text-align: center;
                        font-weight: bold;
                        margin-top:0.5rem;   
                    }
                }
                }
            
        }
    }     
    .noi-results-loader{
        color: rgba(0, 0, 0, 0.5);
        margin:50px 0;
    }
    .noi-selection-bar{
        background-color: white;
        border-top: 1px solid #ced4da;
        border-bottom: 1px solid #ced4da;
        color: black;
        height: 4rem;
        position: sticky;
        bottom: 0;
        z-index: 2;

        .price{
            float: right;
            display: inline;
            margin: 1.05rem 2rem;
            font-weight: bold;
            font-size: 1.5rem;
        }

        .selection{
            font-size: 1.125rem;
            font-weight: bold;
            margin: 1.25rem 0;
            display: inline;
            float: left;

            &.selected{
                margin:0.7rem 0
            }

            &:nth-child(2){
                border-left: 1px solid #ced4da;
                margin-left: 1rem;
                padding-left: 1rem;
            }

            div{
                float: left;
                display: inline;
            }
            div.description{
                margin-left: 0.5rem;
            }

            span{
                display: block;
            }
            span.title{
                font-weight: bold;
                font-size: 1.25rem;
            }
            span.subtitle{
                font-weight: normal;
                font-size: 0.875rem;
            }
        }
        .continue-button{
            font-size: 1.125rem;
            margin: 0.45rem 0;
            padding: 0.8rem 2rem;
            display: inline;
            float: right;
            max-width: fit-content;
        }
    }
    
    //buttons
    .button {
        background-color: white;
        border: 1px solid var(--noi-secondary, black);
        color: var(--noi-text-primary, black);
        cursor: pointer;
        padding: 0.5rem 1.5rem;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        font-size: 1.5rem;
        font-weight: bold;
        width: 100%;
        max-width: 8rem;
        border-radius: 0.25rem;

        &.dark{
            font-size: 1rem;
            padding: 1rem 2rem;
            background-color: var(--noi-secondary, black);
            border: none;
            color: var(--noi-text-seconday, white);
            max-width:none;
        }
        &:hover,&.selected{
            background-color: var(--noi-secondary, black);
            border: none;
            color: var(--noi-text-seconday, white);
        }
        &.disabled{
            opacity:0.6;
            cursor: auto;
        }
    }

    // calendar
    .mx-icon-calendar{
        display: none;
    }
    .mx-icon-clear{
        position: absolute;
        right: 15px;
        top: 15px;
    }
    .noi-datepicker-input{
        height: calc(3.5rem + calc(var(--bs-border-width) * 2));
        min-height: calc(3.5rem + calc(var(--bs-border-width) * 2));
        line-height: 1.25;
        padding: 1.625rem 0.75rem 0.625rem 0.75rem;
    }
    .noi-input-label{
        position: absolute;
        top: 0;
        left: 0;
        z-index: 2;
        height: 100%;
        padding: 1rem 0.75rem;
        overflow: hidden;
        text-align: start;
        text-overflow: ellipsis;
        white-space: nowrap;
        pointer-events: none;
        border: var(--bs-border-width) solid transparent;
        transform-origin: 0 0;
        transition: opacity 0.1s ease-in-out, transform 0.1s ease-in-out;
    }
    .noi-input-label.focused{
        color: rgba(var(--bs-body-color-rgb), 0.65);
        transform: scale(0.85) translateY(-0.5rem) translateX(0.15rem);
    }

    


    .footer {
        background: #F5F4F6;
        width: 100%;
        text-align: right;
        font-size: 1rem;
        margin:0;
    }

}
</style>