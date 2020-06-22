<template>
    <div class="monitor-body">
        <h1>
            <span>系统监控</span>
            <el-button style="float: right" type="primary" @click="loadData" icon="el-icon-refresh" size="medium">刷新</el-button>
        </h1>
        <el-table
                :data="tableData">
            <el-table-column
                    prop="key"
                    label="属性"
                    width="300">
            </el-table-column>
            <el-table-column
                    prop="value"
                    label="值">
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
    export default {
        name: "Monitor",
        data() {
            return {
                info: {},
                tableData: [],
                timer: null,
            };
        },
        methods: {
            loadData() {
                this.$http.get('admin/monitor').then((response) => {
                    this.info = response.data.data;
                    this.tableData = [];
                    this.tableData.push({key: "服务器总空间", value: this.info.totalSpace + " GB"});
                    this.tableData.push({key: "可用空间剩余", value: this.info.freeSpace + " GB"});
                    this.tableData.push({key: "服务器名", value: this.info.osName});
                    this.tableData.push({key: "操作系统", value: this.info.osDesciption});
                    this.tableData.push({key: "CPU 架构", value: this.info.machineArch});
                    this.tableData.push({key: "系统启动时间", value: this.info.upTime});
                    this.tableData.push({key: "系统总内存", value: this.info.totalMemory + " GB"});
                    this.tableData.push({key: "系统空闲内存", value: this.info.freeMemory + " GB"});
                    this.tableData.push({key: "CLR 版本", value: this.info.clrVersion});
                });
            }
        },
        mounted() {
            this.loadData();
            // if (this.timer) {
            //     clearInterval(this.timer);
            // } else {
            //     this.timer = setInterval(() => {
            //         this.loadData();
            //     }, 1000);
            // }
        },
        // destroyed() {
        //     clearInterval(this.timer);
        // },
    }
</script>

<style scoped>

    .monitor-body {
        margin: 20px;
    }

</style>