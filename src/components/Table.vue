<template>
  <div class="h-100">
    <div class="navbar">
      <span class="h3" @click="changeTableName">{{table}}</span>
      <div class="flex-grow-1"></div>
      <button
        @click="editColumn = !editColumn"
        class="btn btn-outline-primary"
        :class="{'active':editColumn}"
      >
        <fa-icon icon="edit" class="mr-3"></fa-icon>Edit Column
      </button>
      <label for="open-file" class="btn btn-outline-success mb-0">
        <fa-icon icon="folder-open" class="mr-3"></fa-icon>Open
      </label>
      <button @click="saveToDB()" class="btn btn-outline-success">
        <fa-icon icon="save" class="mr-3"></fa-icon>Save
      </button>
      <input class="d-none" type="file" id="open-file" @change="loadFromFile" />
    </div>

    <draggable
      v-if="editColumn"
      v-model="columns"
      group="people"
      @start="drag=true"
      @end="drag=false"
      class="list-group"
    >
      <div v-for="(c, i) in columns" :key="c.name" class="list-group-item">
        {{c.name}}
        <button @click="changeColumnName(i)" class="btn btn-warning">
          <fa-icon icon="edit"></fa-icon>
        </button>
      </div>
      <button class="list-group-item active" @click="addColumn()">
        <fa-icon icon="plus"></fa-icon>
      </button>
    </draggable>

    <table v-else class="table table-hover table-sm mb-0">
      <thead class="thead-light">
        <tr>
          <th v-for="(c) in columns" :key="c.name">{{c.name}}</th>
          <th style="width:1px;padding-right:24px">
            <button @click="truncate()" class="btn btn-danger">
              <fa-icon icon="trash"></fa-icon>
            </button>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(r, i) in filteredRows" :key="i">
          <td v-for="c in columns" :key="c.name" @dblclick="editRow(i, c.name)">{{r[c.name]}}</td>
          <td>
            <button @click="remove(i)" class="btn btn-danger">
              <fa-icon icon="trash"></fa-icon>
            </button>
          </td>
        </tr>
        <!--  -->
        <tr>
          <td v-for="(c, ci) in columns" :key="c.name">
            <input class="form-control" v-model="columns[ci].tempSlot" />
          </td>
          <td>
            <button @click="insert()" class="btn btn-primary">
              <fa-icon icon="plus"></fa-icon>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import Vue from 'vue'
import XLSX from 'xlsx'
import utils from '../utils'
// import { openDB } from 'idb';



export default {
  name: 'Table',
  data() {
    return {
      rows: [],
      filteredRows: [],
      editColumn: false,
      table: "table-name",
      columns: [],
      db: null,
    }
  },
  methods: {
    async loadFromDB() {
      try {
        const store = this.db.transaction([this.table]).objectStore(this.table);
        this.rows = await store.get('rows') || [];
        this.columns = await store.get('columns') || [utils.createColumn('column1')];
        this.updateView();
      } catch (error) {
        this.rows =  [];
        this.columns = [utils.createColumn('column1')];

      }
    },
    async saveToDB() {
      // const store = this.db.transaction([this.table], "readwrite").objectStore(this.table);
      // await store.put('rows', this.rows);
      // await store.put('columns', this.columns);
      // alert('Finished saving to local browser');
    },
    async loadFromFile(ev) {
      const file = ev.target.files[0];
      const result = await utils.readFileAsync(file);

      let wb = XLSX.read(result, {type:"buffer"});
      let data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {header:1});
      this.columns = Object.values(data[0]).map(k => utils.createColumn(k));
      data.splice(0,1);
      this.rows = data.map(x => {
        var o = {};
        this.columns.forEach((c, i) => {
          o[c.name] = x[i];
        });
        return o;
      });
      this.updateView();

    },
    updateView() {
      this.filteredRows = this.rows.slice(0, 100);
    },
    addColumn() {
      var newname = prompt('Input new column name...');
      if (!newname || this.columns.some(x => x.name == newname)) return;
      this.rows.forEach(el => {
        Vue.set(el, newname, '');
      });
      this.columns.push(utils.createColumn(newname));
      this.updateView();
    },
    changeColumnName(i) {
      var oldname = this.columns[i].name;
      var newname =  prompt('Input new column name...', oldname) || oldname;
      if (newname == oldname || this.columns.some(x => x.name == newname)) return;
      this.rows.forEach(el => {
        let val = el[oldname];
        Vue.delete(el, oldname);
        Vue.set(el, newname, val);
      });
      this.columns[i].name = newname;
      this.updateView();
    },
    changeTableName() {
      this.table = prompt('Input new table name...', this.table) || this.table;
      this.updateView();
    },
    remove(i) {
      this.rows.splice(i, 1);
      this.updateView();
    },
    truncate() {
      this.rows = [];
      this.updateView();
    },
    insert() {
      var obj = {};
      this.columns.forEach(c => obj[c.name] = c.tempSlot);
      this.rows.push(obj);
      this.updateView();
    },
    editRow(r, c) {
      let newcontent = prompt('edit content...', this.rows[r][c]);
      if (newcontent !== null) {
        this.rows[r][c] = newcontent;
        this.updateView();
      }
    },
  },
  async mounted() {
      // const vm = this;
      // this.db = await openDB('bgdte', 1, {
      //   upgrade(db, oldv, newv) {
      //     var objectStore = db.createObjectStore(vm.table, { keyPath: "taskTitle" });
      //     objectStore.createIndex('')
      //   }
      // });
      // await this.loadFromDB();
  },
  beforeDestroy() {
  }
}
</script>

<style>
a {
  color: #42b983;
}
table td,
table th {
  vertical-align: middle !important;
}
.navbar {
  height: 60px;
}
table {
  position: absolute;
  bottom: 0px;
  height: calc(100% - 60px);
}
thead {
  height: 48px;
}
tbody {
  position: absolute;
  top: 48px;
  bottom: 0;
  overflow-y: auto;
}
</style>
