<!--  
    SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
    SPDX-License-Identifier: AGPL-3.0-or-later  
-->
<template>
  <div>
    <date-picker
      v-model="value"
      format="hh:mm a"
      value-type="format"
      type="time"
      placeholder="hh:mm a"
    ></date-picker>
  </div>
</template>

<script>
export default {
  name: 'ControlOpen',
  data() {
    return {
      value: '',
    };
  },
};
</script>
