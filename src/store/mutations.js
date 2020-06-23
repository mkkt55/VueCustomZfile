export default {
    tableData(state, v) {
        state.tableData = v;
    },
    updateConfig(state, v) {
        state.config = v;
    },
    currentDirectory(state, v) {
        state.currentDirectory = v;
    },
    hoverRow(state, v) {
        state.hoverRow = v;
    },
    rightClickRow(state, v) {
        state.rightClickRow = v;
    },
    appendTableData(state, v) {
        if (v) {
            state.tableData = state.tableData.concat(v);
        }
    },
    removeTableData(state, name){
        if (name) {
            let index = 0;
            for (let i = 0; i < state.tableData.length; i++){
                let item = state.tableData[i];
                if (item.name == name){
                    index = i;
                    break;
                }
            }
            state.tableData.splice(index, 1)
        }
    },
    updateSearchParam(state, v) {
        state.searchParam = v;
    }
}