<template>
    <el-row>
        <el-col :offset="1"
                element-loading-text="保存并初始化中.">
            <h1>驱动器列表</h1>

            <div style="margin-top: 20px">
                <el-button type="primary" size="mini" @click="addDrive">新增</el-button>
            </div>

            <el-table
                    :data="driveList"
                    style="width: 100%">
                <el-table-column
                        type="index"
                        label="序号"
                        width="100">
                </el-table-column>
                <el-table-column
                        prop="name"
                        label="驱动器名称">
                </el-table-column>
                <el-table-column
                        label="操作"
                        width="300">
                    <template slot-scope="scope">
                        <template>
                            <el-button slot="reference" class="el-icon-edit" size="mini" type="primary" @click="editDrive(scope.row)">编辑</el-button>
                            <el-button slot="reference" :disabled="!scope.row.enableCache" class="el-icon-s-operation" size="mini" type="primary" @click="cacheManage(scope.row)">缓存管理</el-button>
                            <el-button @click="deleteDrive(scope.row)" class="el-icon-delete" size="mini" type="danger">删除</el-button>
                        </template>
                    </template>
                </el-table-column>
            </el-table>

            <el-dialog width="80%" title="驱动器设置" :visible.sync="driveEditDialogVisible" top="10vh" :destroy-on-close="true">

                <el-form v-loading="loading"
                         element-loading-text="保存并初始化中."
                         id="siteForm" ref="form" :model="driveItem" :rules="rules" label-width="auto" :status-icon="true">
                    <el-row :gutter="50">
                        <el-col :span="12">
                            <el-form-item label="驱动器名称" prop="name">
                                <el-input v-model="driveItem.name"/>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-form>
                <div slot="footer" class="dialog-footer" style="text-align: center">
                    <el-button type="primary" :disabled="loading" @click="submitForm('form')">保 存</el-button>
                    <el-button @click="driveEditDialogVisible = false">取 消</el-button>
                </div>
            </el-dialog>
        </el-col>
    </el-row>
</template>

<script>
    // import qs from 'qs';

    export default {
        name: "DriveList",
        data() {
            return {
                loading: false,
                driveList: [],
                driveItem: {
                    id: 0,
                    name: '',
                    protect: false,
                    password: null,
                },
                driveEditDialogVisible: false,
                rules: {
                }
            }
        },
        methods: {
            change() {
                this.$forceUpdate();
            },
            editDrive(row) {
                Object.assign(this.driveItem, this.driveList[row.id]);
                this.driveEditDialogVisible = true;
            },
            deleteDrive(row) {
                this.$confirm('是否确认删除？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                    callback: action => {
                        if (action === 'confirm') {
                            this.$http.delete('admin/drive/' + row.id).then((response) => {
                                if (response.data.code === 0) {
                                    this.$message.success('删除成功');
                                    this.init();
                                } else {
                                    this.$message.success('删除失败');
                                }
                            });
                        }
                    }
                });
            },
            addDrive() {
                Object.assign(this.driveItem, this.$options.data().driveItem);
                this.driveItem.id = null;
                this.driveEditDialogVisible = true;
            },
            submitForm(formName) {
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        this.loading = true;
                        this.$http.post('admin/drive', this.driveItem).then((response) => {
                            let data =  response.data;
                            this.$message({
                                message: data.msg,
                                type: data.code === 0 ? 'success' : 'error',
                                duration: 1500,
                            });
                            this.driveEditDialogVisible = false;
                            this.init();
                            this.loading = false;
                        }).catch(()=>{
                            this.loading = false;
                        })
                    } else {
                        return false;
                    }
                });
            },
            init() {
                this.$http.get('api/drive/list').then((response) => {
                    this.driveList = response.data.data;
                });
            }
        },
        mounted() {
            this.init();
        }
    }
</script>

<style scoped>
    .zfile-word-aux {
        margin-left: 20px;
        color: #aaaaaa;
    }

    .el-row {
        padding: 20px;
    }

    .el-form-item {
        margin-right: 50px;
    }

    .card-title {
        color: rgba(0,0,0,.45);
        font-size: 14px;
    }

    .card-content {
        color: rgba(0,0,0,.85);
        font-size: 25px;
        line-height: 30px;
    }

    .card-title-button {
        float: right;
        padding: 3px 0;
    }

    .table-search-input {
        width: 300px;
        float: right;
    }
</style>
