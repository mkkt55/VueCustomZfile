<template>
    <div id="List">
        <el-button type="default" class="top-button" @click="showFolderDialog=true">创建文件夹</el-button>
        <el-button type="default" class="top-button" @click="selectFile">上传文件</el-button>
        <input type="file" ref="fileUploader" v-show="false" @change="uploadFile"/>
        <el-table ref="fileTable" id="ListTable"
                  class="transition-box"
                  :data="this.$store.getters.tableData"
                  @cell-mouse-enter="updateInfoHover"
                  @cell-mouse-leave="updateInfoLeave"
                  @row-click="openFolder"
                  :height="$store.getters.showDocument && $store.state.config.readme !== null ? '50vh' : '84vh'"
                  :size="$store.getters.tableSize"
                  @row-contextmenu="showMenu">
            <el-table-column
                    prop="name"
                    label="文件名"
                    label-class-name="table-header-left"
                    min-width="100%">
                <template slot-scope="scope">
                    <svg class="icon" aria-hidden="true"><use :xlink:href="'#' + scope.row.icon"/></svg>
                    {{scope.row.name}}
                </template>
            </el-table-column>
            <el-table-column
                    prop="time"
                    label="修改时间"
                    class-name="hidden-xs-only"
                    min-width="20%">
            </el-table-column>
            <el-table-column
                    prop="size"
                    label="大小"
                    class-name="hidden-xs-only"
                    :formatter="this.common.fileSizeFilter"
                    min-width="15%">
            </el-table-column>

            <el-table-column
                    label="操作"
                    min-width="15%">
                <template slot-scope="scope">
                    <div v-if="scope.row.type === 'FILE'">
                        <i @click.stop="downloadFile" class="el-icon-download operator-btn"></i>
                        <i @click.stop="deleteFile" class="el-icon-delete operator-btn"></i>
                    </div>
                    <div v-if="scope.row.type === 'FOLDER'">
                        <i @click.stop="deleteDir" class="el-icon-delete operator-btn"></i>
                    </div>
                </template>
            </el-table-column>

            <slot></slot>
            <template slot="append">
                <!--
                @infinite: 滚动事件回调函数,当滚动到距离滚动父元素底部特定距离的时候，会被调用
                distance: 这是滚动的临界值。default: 100; 如果到滚动父元素的底部距离小于这个值，那么 loadMore 回调函数就会被调用。
                spinner: 通过这个属性，你可以选择一个你最喜爱旋转器作为加载动画
                      'default' | 'bubbles' | 'circles' | 'spiral' | 'waveDots'
                direction: 如果你设置这个属性为top,那么这个组件将在你滚到顶部的时候，调用on-infinite函数
                      'top' | 'bottom'
                forceUseInfiniteWrapper: (boolean | string) 强制指定滚动容器，使用CSS 选择器
                identifier: 识别号，改变时刷新
                -->
                <infinite-loading
                        @infinite="infiniteHandler"
                        ref="infiniteLoading"
                        spinner="bubbles"
                        force-use-infinite-wrapper=".el-table__body-wrapper">
                    <!--   orce-use-infinite-wrapper 属性在存在多个 el-table 需要更详细的css选择器   -->
                    <div class="no-more" slot="no-more">
                        我~是有底线的 (～￣▽￣)～
                    </div>
                    <div class="no-more" slot="no-results">
                        暂无更多结果 Ծ‸Ծ
                    </div>
                    <div class="no-more" slot="error">
                        出错了 (╯‵□′)╯︵┻━┻
                    </div>
                </infinite-loading>
            </template>
        </el-table>

        <el-dialog id="textDialog" :destroy-on-close="true"
                   :title="currentClickRow.name"
                   :visible.sync="dialogTextVisible"
                   :top="'5vh'"
                   :width="'90%'"
                   @opened="initTextDialog">
            <TextPreview :file="currentClickRow" ref="textDialog"/>
        </el-dialog>

        <el-dialog id="videoDialog" :destroy-on-close="true"
                   :title="currentClickRow.name"
                   :visible.sync="dialogVideoVisible">
            <video-player v-if="dialogVideoVisible" ref="videoPlayer" :data="currentClickRow"/>
        </el-dialog>

        <audio-player :file-list="this.$store.getters.filterFileByType('audio')" :audio-index="currentClickTypeIndex('audio')"/>

        <v-contextmenu ref="contextmenu">
            <v-contextmenu-item @click="preview">
                <i class="el-icon-view"></i>
                <label v-html="hoverRow.type === 'FILE' ?  '预览' : '打开'"></label>
            </v-contextmenu-item>
            <v-contextmenu-item @click="downloadFile" v-show="hoverRow.type === 'FILE'">
                <i class="el-icon-download"></i>
                <label>下载</label>
            </v-contextmenu-item>
        </v-contextmenu>

        <el-dialog width="80%" title="" :visible.sync="showFolderDialog" top="10vh" :destroy-on-close="true">

                <el-form v-loading="loading"
                         element-loading-text="保存并初始化中."
                         id="siteForm" ref="form" :model="folderItem" :rules="rules" label-width="auto" :status-icon="true">
                    <el-row :gutter="50">
                        <el-col :span="12">
                            <el-form-item label="文件夹名称" prop="name">
                                <el-input v-model="folderItem.newName"/>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-form>
                <div slot="footer" class="dialog-footer" style="text-align: center">
                    <el-button type="primary" :disabled="loading" @click="createDir()">保 存</el-button>
                    <el-button @click="showFolderDialog = false">取 消</el-button>
                </div>
            </el-dialog>
    </div>
</template>

<script>
    import path from 'path'
    import 'element-ui/lib/theme-chalk/display.css';

    const VideoPlayer = () => import(/* webpackChunkName: "front-video" */'./VideoPlayer');
    const TextPreview = () => import(/* webpackChunkName: "front-text" */'./TextPreview');
    const AudioPlayer = () => import(/* webpackChunkName: "front-audio" */'./AudioPlayer');

    import store from "@/store";

    let prefixPath = '/main';

    export default {
        components: {
            VideoPlayer, TextPreview, AudioPlayer
        },
        props: ['driveId'],
        created() {
            this.init();
        },
        data() {
            return {
                // 是否初始化加载完成
                loading: false,
                // 当前鼠标悬浮的行
                hoverRow: {},
                state: null,
                // 是否打开文本浏览器弹出
                dialogTextVisible: false,
                // 是否打开视频播放器弹出
                dialogVideoVisible: false,
                // 查询条件
                searchParam: {
                    path: '',
                    password: '',
                    page: 1
                },
                totalPage: 1,
                // 当前点击文件
                currentClickRow: {},
                contextMenuDataAxis: {
                    x: null,
                    y: null
                },
                driveList: [],
                newFolderName: '',
                showFolderDialog: false,
                folderItem:{
                    newName: '',
                    path: ''
                },
                rules: {
                },
            }
        },
        watch: {
            'searchParam.path': {
                deep: true,
                handler(newVal) {
                    if (this.$store.state.searchParam && newVal === '/') {
                        return;
                    }
                    this.updateTitle();
                    this.searchParam.password = this.getPathPwd();
                    this.searchParam.page = 1;
                    this.loadingConfig();
                    if (this.state) {
                        store.commit('tableData', []);
                        this.state.reset();
                    }
                }
            },
            '$route.fullPath': function () {
                this.searchParam.path = this.$route.params.pathMatch;
                if (this.$store.state.searchParam && this.searchParam.path === '/') {
                    return;
                }
                this.updateTitle();
                this.searchParam.password = this.getPathPwd();
                this.searchParam.page = 1;
                this.loadingConfig();
                if (this.state) {
                    store.commit('tableData', []);
                    this.state.reset();
                }

            },
            '$store.state.searchParam': function () {
                if (!this.$route.fullPath.startsWith("/main")) {
                    this.$router.push('/main');
                }
                this.searchParam.page = 1;
                this.searchParam.path = '/';

                this.state.reset();
                store.commit('tableData', []);
            }
        },
        methods: {
            getCurrentPath(){
                let path = this.searchParam.path;
                return path;
            },
            getHoverPath(){
                let pathToDrive = this.hoverRow.url;
                pathToDrive = pathToDrive.substring(pathToDrive.indexOf('/') + 1);
                pathToDrive = pathToDrive.substring(pathToDrive.indexOf('/') + 1);
                return pathToDrive;
            },
            createDir() {
                // console.log(this.$store.getters.tableData)
                this.$http.post('api/update-folder?driveId=' + this.driveId + '&pathToDrive=' + this.getCurrentPath() + '/' + this.folderItem.newName).then((response) => {
                    let data =  response.data;
                    this.$message({
                        message: data.msg,
                        type: data.code === 0 ? 'success' : 'error',
                        duration: 1500,
                    });
                    this.showFolderDialog = false;
                    this.refreshList();
                    this.loading = false;
                }).catch(()=>{
                    this.loading = false;
                })
            },
            deleteDir() {
                let pathToDrive = this.getHoverPath();
                this.$confirm('是否确认删除？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                    callback: action => {
                        if (action === 'confirm') {
                            this.$http.delete('api/del-dir?driveId=' + this.driveId + '&pathToDrive=' + pathToDrive).then((response) => {
                                if (response.data.code === 0) {
                                    this.$message.success('删除成功');
                                    this.refreshList();
                                } else {
                                    this.$message.success('删除失败');
                                }
                            });
                        }
                    }
                });
            },
            selectFile(){
                this.$refs.fileUploader.click();
            },
            uploadFile(e){
                // let pathToDrive = this.getHoverPath();
                let file = e.target.files[0];
                let param = new FormData(); //创建form对象
                param.append('file',file);//通过append向form对象添加数据
                param.append("driveId", this.driveId);
                param.append("pathToDrive", this.getCurrentPath());
                
                // console.log(param.get('file')); //FormData私有类对象，访问不到，可以通过get判断值是否传进去

                //添加请求头
                let config = {
                    headers:{'Content-Type':'multipart/form-data'}
                }; 
                
                this.$http.post('/api/upload-file', param, config)
                .then(response=>{
                    console.log(response.data);
                    this.refreshList();
                })

                // console.log(this.hoverRow.url)
            },
            downloadFile() {
                let pathToDrive = this.getHoverPath();
                this.$http.get('api/download-file?driveId=' + this.driveId + '&pathToDrive=' + pathToDrive, { responseType:"blob" }).then((response) => {
                    let fileName = pathToDrive;
                    fileName = fileName.split("/");
                    fileName = fileName[fileName.length - 1];
                    this.saveFile(response.data, fileName);
                });
            },
            saveFile (data, name) {
                // console.log(data)
                if (!data) {
                    return;
                }
                let url = window.URL.createObjectURL(new Blob([data]));
                let link = document.createElement('a');
                link.style.display = 'none';
                link.href = url;
                link.setAttribute('download', name);

                document.body.appendChild(link);
                link.click();
                
                //释放URL对象所占资源
                window.URL.revokeObjectURL(url);
                //用完即删
                document.body.removeChild(link);
            },
            deleteFile(){
                let pathToDrive = this.getHoverPath();

                this.$confirm('是否确认删除？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                    callback: action => {
                        if (action === 'confirm') {
                            this.$http.delete('api/del-file?driveId=' + this.driveId + '&pathToDrive=' + pathToDrive).then((response) => {
                                if (response.data.code === 0) {
                                    this.$message.success('删除成功');
                                    this.refreshList();
                                } else {
                                    this.$message.success('删除失败');
                                }
                            });
                        }
                    }
                });
            },
            updateTitle() {
                let basepath = path.basename(this.searchParam.path);

                let config = this.$store.state.config;
                let siteName = '';
                if (config.viewConfig) {
                    siteName = ' | ' + this.$store.state.config.viewConfig.siteName;
                }

                if (basepath === '/' || basepath === '') {
                    document.title = "首页" + siteName;
                } else {
                    document.title = basepath + siteName;
                }
            },
            showMenu() {
                event.preventDefault();
                this.$refs.contextmenu.show({
                    top: event.clientY,
                    left: event.clientX
                });
                this.$refs.contextmenu.$el.hidden = false;
            },
            infiniteHandler($state) {
                if ($state) {
                    this.state = $state;
                }

                if (!this.driveId) {
                    return;
                }

                let url, param;
                if (this.$store.state.searchParam) {
                    url = 'api/search';
                    param = {name: this.$store.state.searchParam, page: this.searchParam.page};
                } else {
                    url = 'api/list/' + this.driveId;
                    param = this.searchParam;
                }
                
                this.$http.get(url, {params: param}).then((response) => {
                    let data = response.data.data;

                    if (response.data.code === -2 || response.data.code === -3) {
                        if (response.data.code === -3) {
                            this.$message.error('密码错误, 请重新输入!',);
                        }
                        this.popPassword();
                        return;
                    }

                    this.totalPage = data.totalPage;

                    let searchPath = this.searchParam.path;

                    if (searchPath !== '' && searchPath !== '/' && this.searchParam.page === 1) {
                        let fullPath = this.$route.params.pathMatch;
                        fullPath = fullPath ? fullPath : '/';
                        let parentPathName = path.basename(path.resolve(fullPath, "../"));
                        data.fileList.unshift({
                            name: parentPathName ? parentPathName : '/',
                            path: path.resolve(searchPath, '../'),
                            type: 'BACK'
                        });
                    }

                    store.commit('tableData', data.fileList);
                    $state.complete();

                    // 以下代码是分页请求用的，不要了
                    // store.commit('appendTableData', data.fileList);
                    // this.searchParam.page++;
                    // if ($state) {
                    //     $state.loaded();
                    // }
                    
                    // if (data.fileList.length === 0 || this.searchParam.page > this.totalPage) {
                    //     $state.complete();
                    // }
                });
            },
            popPassword() {
                this.$prompt('请输入密码', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    inputValidator(val) {
                        return !!val
                    },
                    inputErrorMessage: '密码不能为空.'
                }).then(({value}) => {
                    if (value !== this.getPathPwd()) {
                        this.putPathPwd(value);
                    }
                    this.state.reset();
                }).catch(() => {
                    this.$router.push("/" + this.driveId + prefixPath + path.resolve(this.searchParam.path, '../'));
                });
            },
            getPathPwd: function() {
                let pwd = sessionStorage.getItem("zfile-pwd-" + this.searchParam.path);
                return pwd === null ? '' : pwd;
            },
            putPathPwd: function(value) {
                sessionStorage.setItem("zfile-pwd-" + this.searchParam.path, value);
                this.searchParam.password = value;
            },
            updateInfoHover: function (row) {
                this.hoverRow = row;
                store.commit('hoverRow', row);
            },
            updateInfoLeave: function () {
                store.commit('hoverRow', null);
            },
            loadingConfig() {
                if (this.driveId) {
                    this.$http.get('api/config/' + this.driveId, {params: {path: this.searchParam.path}}).then((response) => {
                        store.commit('updateConfig', response.data.data);
                    });
                }
            },
            openFolder(row) {
                this.currentClickRow = row;
                if (row.type === 'FILE') {
                    if (this.$store.getters.storageStrategy === 'ftp') {
                        this.$message({
                            message: 'FTP 模式, 不支持预览功能, 已自动调用下载',
                            type: 'warning'
                        });
                        this.download();
                        return;
                    }

                    let fileType = this.common.getFileType(row.name);

                    switch (fileType) {
                        case 'video':
                            this.openVideo();
                            break;
                        case 'image':
                            this.openImage();
                            break;
                        case 'text':
                            this.openText();
                            break;
                        case 'audio':
                            this.openAudio();
                            break;
                        default:
                            this.download();
                    }
                } else {
                    let path;
                    if (row.type === 'BACK') {
                        path = row.path;
                    } else {
                        path = this.common.removeDuplicateSeparator(row.path + '/' + row.name)
                    }

                    if (path.indexOf('/') !== 0) {
                        path = '/' + path;
                    }

                    this.$router.push("/" + this.driveId + prefixPath + path);
                }
            },
            openImage() {
                let imageDate = [];
                for (let image of this.$store.getters.filterFileByType('image')) {
                    imageDate.push({
                       alt: image.name,
                       src: image.url
                    });
                }

                this.layer.photos({
                    photos: {
                        "data": imageDate,
                        "start": this.currentClickTypeIndex('image')
                    }
                    , anim: 5
                    , shade: 0.5
                });
            },
            openAudio() {
            },
            openText() {
                this.dialogTextVisible = true;
            },
            openVideo() {
                this.dialogVideoVisible = true;
            },
            initTextDialog() {
                this.$refs.textDialog.init();
            },
            preview() {
                this.openFolder(this.hoverRow);
            },
            init(){
                let p = this.$route.params.pathMatch;
                this.searchParam.path = p ? p : '/';
            },
            refreshList(){
                // location.reload();
                // this.$router.go(0)

                this.$http.get('api/list/' + this.driveId, {params: this.searchParam}).then((response) => {
                    let data = response.data.data;

                    this.totalPage = data.totalPage;

                    let searchPath = this.searchParam.path;

                    if (searchPath !== '' && searchPath !== '/' && this.searchParam.page === 1) {
                        let fullPath = this.$route.params.pathMatch;
                        fullPath = fullPath ? fullPath : '/';
                        let parentPathName = path.basename(path.resolve(fullPath, "../"));
                        data.fileList.unshift({
                            name: parentPathName ? parentPathName : '/',
                            path: path.resolve(searchPath, '../'),
                            type: 'BACK'
                        });
                    }

                    store.commit('tableData', data.fileList);
                });
            }
        },
        computed: {
            // 当前点击类型的索引
            currentClickTypeIndex() {
                return (fileType) => {
                    let currentClickRow = this.currentClickRow;
                    if (currentClickRow.type !== 'FILE') {
                        return -1;
                    }

                    if (JSON.stringify(currentClickRow) === '{}') {
                        return 0;
                    } else {
                        fileType = fileType ? fileType : this.common.getFileType(currentClickRow.name);
                        return this.$store.getters.filterFileByType(fileType).findIndex((item) => {
                            return item.name === currentClickRow.name;
                        })
                    }
                }
            }
        }
    }
</script>

<style scoped>
    #List {
        overflow: hidden;
    }

    .el-table {
        margin: 20px 0 0 20px;
        padding-right: 30px;
        overflow-y: hidden;
    }

    .el-table::before {
        height: 0;
    }

    .el-table svg {
        font-size: 18px;
        margin-right: 15px;
    }

    #ListTable >>> .table-header-left {
        margin-left: 38px;
    }

    #ListTable >>> tr {
        cursor: pointer;
    }

    .el-scrollbar >>> .el-scrollbar__wrap {
        overflow-x: hidden !important;
    }

    /*视频弹窗样式 -- 去除内容边框*/
    #videoDialog >>> .el-dialog__body {
        padding: 10px 0 0 0;
    }

    /* 弹窗标题居中, 高度减少 */
    #List >>> .el-dialog__header {
        text-align: center;
        margin-bottom: -10px;
        padding: 5px 0 5px 0;
    }

    #videoDialog >>> .el-dialog__headerbtn {
        top: 10px;
    }

    #textDialog >>> .el-dialog {
        margin-bottom: 0;
    }

    .v-contextmenu-item >>> label {
        margin-left: 10px;
    }

    @media screen and (max-device-width: 1920px) {
        #videoDialog >>> .el-dialog {
            margin-top: 5vh !important;
            width: 70% !important;
        }
    }

    @media screen and (max-device-width: 769px) {
        #videoDialog >>> .el-dialog {
            margin-top: 10vh !important;
            width: 90% !important;
        }
    }

    .operator-btn {
        color: #1E9FFF;
        margin-right: 20px;
        font-size: 16px
    }

    .top-button{
        margin-top: 10px;
        margin-left: 20px;
    }

    .el-row {
        padding: 20px;
    }

    .el-form-item {
        margin-right: 50px;
    }

    .card-title-button {
        float: right;
        padding: 3px 0;
    }
</style>
