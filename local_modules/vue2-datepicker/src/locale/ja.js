/* 
    SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
    SPDX-License-Identifier: AGPL-3.0-or-later 
*/
import DatePicker from 'vue2-datepicker';
import ja from 'date-format-parse/lib/locale/ja';

const lang = {
  formatLocale: ja,
  yearFormat: 'YYYY',
  monthFormat: 'MMM',
  monthBeforeYear: false,
};

DatePicker.locale('ja', lang);

export default lang;
