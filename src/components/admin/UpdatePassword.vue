<template>
    <el-row>
        <el-col :span="12">
            <el-form id="pwdForm" ref="form"
                     @keyup.enter.native="submitForm('form')"
                     :model="form" label-width="auto" :status-icon="true">
                <el-form-item label="请验证账号">
                    <el-input v-model.trim="username"/>
                </el-form-item>
                
                <el-form-item label="输入旧密码" prop="oldpassword">
                    <el-input v-model.trim="password"/>
                </el-form-item>

                <el-form-item label="设置新密码" prop="password">
                    <el-input v-model.trim="newPassword"/>
                </el-form-item>

                <el-form-item label="确认密码" prop="repassword">
                    <el-input v-model.trim="rePassword"/>
                </el-form-item>

                <el-form-item>
                    <el-button type="primary" @click="submitForm()">确认</el-button>
                </el-form-item>
            </el-form>
        </el-col>
    </el-row>
</template>

<script>

    import qs from 'qs'

    export default {
        name: "UpdatePassword",
        data() {
            return {
                username: '',
                password: '',
                newPassword: '',
                rePassword: ''
            };
        },
        methods: {
            submitForm() {
                let form = {
                    username: this.username,
                    password: this.password,
                    newPassword: this.newPassword
                }
                if (this.username === ""){
                    this.$message({
                        message: '请输入管理员账号',
                        type: 'error'
                    });
                }
                else if (this.password === ""){
                    this.$message({
                        message: '请输入旧密码',
                        type: 'error'
                    });
                }
                else if (this.newPassword === ""){
                    this.$message({
                        message: '请输入新密码',
                        type: 'error'
                    });
                }
                else if (this.rePassword !== this.newPassword){
                    this.$message({
                        message: '两次新密码不相同',
                        type: 'error'
                    });
                }
                else{
                    this.$http.post('admin/update-pwd', qs.stringify(form)).then((response) => {
                        if (response.data.code === 0) {
                            this.$message({
                                message: '保存成功',
                                type: 'success'
                            });
                            this.$router.push({"path":"/login"})
                        }
                        else{
                            this.$message({
                                message: response.data.msg,
                                type: 'error'
                            });
                        }
                    })
                }
            }
        },
        mounted() {
            // this.$http.get('admin/config').then((response) => {
            //     this.username = response.data.data.username;
            // })
        }
    }
</script>

<style scoped>
    #pwdForm {
        margin-top: 20px;
        margin-left: 20px;
    }
</style>