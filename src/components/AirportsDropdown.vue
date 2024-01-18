<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>

SPDX-License-Identifier: AGPL-3.0-or-later
-->
<template>
    <div class="form-floating airports-selector">
        <input  class="form-control airports-selector-input" 
                :name="name" 
                type="text"
                ref="passengers"
                autocomplete="off"
                v-model="searchText" 
                @focus="onFocus"
                @blur="onBlur"
                placeholder="Search something..." >

        <div class="airport-dropdown-container text-left" v-bind:class="classObject">            
            <div v-for="(cluster, index) in filteredClusters" class="airport-dropdown-cluster">
                <div class="airport-dropdown-element clusterParent text-start" @click="selectAirport(cluster)">
                    {{ cluster.label }}
                </div>

                <div class="airport-dropdown-element" v-for="(airport, index) in cluster.airports" @click="selectAirport(airport)">
                    <div class="row ">
                        <span class="col text-start">{{ airport.label }}</span> 
                        <span class="col text-end">{{ airport.value }}</span>
                    </div>
                </div>
            </div>
        </div>
        
        <label :for="name" class="form-label">
            {{ placeholder }}
        </label>
    </div>

</template>

<script>
    
    export default {
        props: {
            name: {
                type: String,
                default: "needToBeARamdumUniqueString"
            },
            initValue: {
                type: Object,
                default: null
            },
            placeholder: {
                type: String,
                default: "Type here"
            },
            clusters: {
                type: [Object, Array],
                required: true
            }
        },
        data() {
            return {
                isOpen: false,
                searchText:'',
                selectedElement:{value:null,label:''}
            }
        },
        mounted:function () {
            if(this.initValue){
                this.searchText = this.initValue.label;
                this.selectedElement = this.initValue;
            }
        },
        computed: {
            filteredClusters() {
                let that = this;
                let filteredClusters = JSON.parse(JSON.stringify(this.clusters));
                if(that.searchText == null){
                    return filteredClusters;
                }

                return filteredClusters.filter(function(cluster) {
                    cluster.airports = cluster.airports.filter(function(airport){
                        return (
                            airport.value.toUpperCase().includes(that.searchText.toUpperCase()) ||
                            airport.label.toUpperCase().includes(that.searchText.toUpperCase())
                        )
                    });
                    
                    if( cluster.airports.length > 0 || 
                        cluster.value.toUpperCase().includes(that.searchText.toUpperCase()) ||
                        cluster.label.toUpperCase().includes(that.searchText.toUpperCase())){
                        return true;
                    }else{
                        return false;
                    }
                })
            },
            classObject() {
                return {
                    'open': this.isOpen && (this.filteredClusters.length > 0)
                }
            },
        },

        watch: {
            'searchText': function(val){
                if(val == ''){
                    this.selectedElement = { 'value': null, 'label': '' };
                }
                this.$emit('searchTextChanged', val);
            },
            'selectedElement': function(val){
                this.$emit('clicked', { 'value': this.selectedElement.value, 'label': this.selectedElement.label });
            }
        },

        methods: {
            setValue(val){
                this.selectAirport(val)
            },
            onFocus() {
                this.isOpen = true
            },
            onBlur() {
                let that = this;
                setTimeout(()=>{
                    that.isOpen = false
                },200);
            },
            selectAirport(el) {
                let selectedValue = el.value
                let selectedLabel = el.label
                this.selectedElement = {
                    value:selectedValue,
                    label:selectedLabel
                }
                                
                this.isOpen = false;
                this.searchText = selectedLabel
            }
        }

    };
</script>

<style lang="scss">

    $lightgrey: #f5f4f6;
    $grey: #e0e0e0;

    .airport-dropdown-container{
        display: none;
        border: 1px solid $grey;
        border-radius: 5px;
        background: white;
        width: calc(100% - 8px);
        height: auto;
        max-height: 30vh;
        padding: 0;
        margin: 1rem 0;
        position: absolute;
        z-index:10;
        overflow: auto;

        .airport-dropdown-cluster{
            
        }

        .airport-dropdown-element{
            background: white;
            cursor: pointer;
            display: block;
            transition: background 0.2s ease-out;
            top:0;
            left:0;
            width:100%;
            padding: 0.8rem 1.5rem;
            
            &:hover,
            &.hover{
                background:$lightgrey;
            }
            
            &.clusterParent{
                font-weight: bold;
            }
        }
        &.open{
            display: block;
        }
    }


    .form-floating > .form-control{
        padding-top: 1.1rem;   
        padding-bottom: 1.1rem;   
    }
    .form-floating > .form-control:focus, .form-floating > .form-control:not(:placeholder-shown), .form-floating > .form-control-plaintext:focus, .form-floating > .form-control-plaintext:not(:placeholder-shown){
        font-weight: 600;
    }
    
</style>