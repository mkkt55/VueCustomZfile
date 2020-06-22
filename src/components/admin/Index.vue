<template>
    <el-row>
        <el-col :span="3">
            <el-menu
                    :default-active="this.$route.path !== '/admin' ? this.$route.path : '/admin/monitor'"
                    class="el-menu-vertical-demo"
                    :router="true">
                <el-menu-item index="/admin/monitor">
                    <i class="el-icon-monitor"/>
                    <span slot="title">系统监控</span>
                </el-menu-item>
                <el-menu-item index="/admin/drive-list">
                    <i class="el-icon-folder-opened"/>
                    <span slot="title">驱动器列表</span>
                </el-menu-item>
                <el-menu-item index="/admin/password">
                    <i class="el-icon-key"/>
                    <span slot="title">修改密码</span>
                </el-menu-item>
                <el-menu-item @click="click">
                    <i class="el-icon-s-home"/>
                    <span slot="title">前往首页</span>
                </el-menu-item>
            </el-menu>
        </el-col>
        <el-col :span="16">
            <keep-alive exclude="CacheManager,SiteSetting">
                <router-view/>
            </keep-alive>
        </el-col>
    </el-row>
</template>

<script>
    export default {
        name: "Index",
        data() {
            return {
                active: '/admin/storage'
            }
        },
        methods: {
            click() {
                window.open('/', '_blank');
            }
        },
        mounted() {
            this.$router.push('/admin/monitor');
        }
    }
</script>

<style scoped>
    .el-row {
        height: 100vh;
    }
    .el-menu {
        height: 100vh;
    }
</style>