<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 警示框 -->
      <el-alert
        type="info"
        title="添加商品信息"
        show-icon
        center
        :closable="false"
      ></el-alert>

      <!-- 步骤条 -->
      <el-steps
        :space="200"
        :active="parseInt(activeIndex)"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <el-form
        :model="addGoodsForm"
        :rules="addGoodsFormRules"
        ref="addGoodsFormRef"
      >
        <!-- tab标签页 -->
        <el-tabs
          :tab-position="'left'"
          v-model="activeIndex"
          :before-leave="beforeTabsLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addGoodsForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input
                v-model="addGoodsForm.goods_price"
                type="number"
              ></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input
                v-model="addGoodsForm.goods_weight"
                type="number"
              ></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input
                v-model="addGoodsForm.goods_number"
                type="number"
              ></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <!-- 商品分类级联选择器 -->
              <el-cascader
                v-model="addGoodsForm.goods_cat"
                :options="categoriesList"
                :props="cascaderProps"
                @change="handleCascaderChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单Item项 -->
            <el-form-item
              :label="item.attr_name"
              v-for="item in manyTableData"
              :key="item.attr_id"
            >
              <el-row>
                <el-col>
                  <!-- 渲染复选框参数 -->
                  <el-checkbox-group v-model="item.attr_vals">
                    <el-checkbox
                      :label="attr"
                      v-for="(attr, index) in item.attr_vals"
                      :key="index"
                      border
                    ></el-checkbox>
                  </el-checkbox-group>
                </el-col>
              </el-row>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              :label="item.attr_name"
              v-for="item in onlyTableData"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals" clearable></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :action="uploadURL"
              :on-preview="handleUploadPreview"
              :on-remove="handleUploadRemove"
              :headers="uploadHeaders"
              list-type="picture"
              :on-success="uploadSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addGoodsForm.goods_introduce"></quill-editor>
            <el-button type="primary" class="add-goods-btn" @click="addGoods"
              >添加商品</el-button
            >
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览 -->
    <el-dialog
      title="图片预览"
      :visible.sync="previewDialogVisible"
      width="50%"
    >
      <el-image :src="uploadPreviewURL" style="width: 100%"></el-image>
    </el-dialog>
  </div>
</template>

<script>
// 引入lodash模块 使用cloneDeep(value)来深度克隆
import _ from "lodash";

export default {
  data() {
    return {
      activeIndex: "0",
      addGoodsForm: {
        goods_name: "",
        goods_price: "",
        goods_weight: "",
        goods_number: "",
        // 商品分类
        goods_cat: [],
        // 上传图片
        pics: [],
        // 商品介绍
        goods_introduce: "",
        // 商品参数
        attrs: [],
      },
      addGoodsFormRules: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" },
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" },
        ],
        goods_weight: [
          { required: true, message: "请输入商品重量", trigger: "blur" },
        ],
        goods_number: [
          { required: true, message: "请输入商品数量", trigger: "blur" },
        ],
        goods_cat: [
          { required: true, message: "请选择三级商品分类", trigger: "change" },
        ],
      },
      // 商品分类数据
      categoriesList: [],
      cascaderProps: {
        expandTrigger: "hover",
        value: "cat_id",
        label: "cat_name",
        children: "children",
      },
      // 动态参数列表数据
      manyTableData: [],
      onlyTableData: [],
      // 图片上传地址
      uploadURL: "http://192.168.2.103:8888/api/private/v1/upload",
      // 图片上传请求头设置
      uploadHeaders: {
        Authorization: window.sessionStorage.getItem("token"),
      },
      uploadPreviewURL: "",
      previewDialogVisible: false,
    };
  },
  created() {
    this.getGoodsCategories();
  },
  methods: {
    async getGoodsCategories() {
      const { data: res } = await this.$axios.get("/categories");
      if (res.status != 200) return this.$message.error(res.msg);
      this.categoriesList = res.data;
    },
    handleCascaderChange() {
      // 只允许选择三级分类
      if (this.addGoodsForm.goods_cat.length != 3)
        this.addGoodsForm.goods_cat = [];
    },
    // Tabs标签页切换的钩子函数
    beforeTabsLeave(activeName, oldActiveName) {
      // 阻止标签页切换
      if (oldActiveName == "0" && this.addGoodsForm.goods_cat.length != 3) {
        this.$message.warning("请选择商品分类");
        return false;
      }
    },
    // Tabs标签页被选中时触发
    async tabClicked() {
      // '0'->基本信息 '1'->商品参数 '2'->商品属性 '3'->商品图片 '4'->商品内容
      if (this.activeIndex == "1") {
        // 获取参数列表
        this.manyTableData = await this.getGoodsParams("many");
      }

      if (this.activeIndex == "2") {
        this.onlyTableData = await this.getGoodsParams("only");
      }
    },
    // 根据参数获取动态参数或静态属性 type == many ? only 返回promise
    async getGoodsParams(type) {
      const { data: res } = await this.$axios.get(
        `/categories/${this.cateId}/attributes`,
        {
          params: { sel: type },
        }
      );
      if (res.status != 200) return this.$message.error(res.msg);
      // 如果为动态参数 则将属性切割为数组
      if (type == "many") {
        res.data.forEach((item) => {
          item.attr_vals =
            item.attr_vals.length == 0 ? [] : item.attr_vals.split(" ");
        });
      }
      return res.data;
    },
    // 图片预览
    handleUploadPreview(file) {
      this.uploadPreviewURL = `http://192.168.2.103:8888/${file.response.data.tmp_path}`;
      this.previewDialogVisible = true;
    },
    // 图片删除
    handleUploadRemove(file) {
      // 获取当前删除的图片路径
      const filePath = file.response.data.tmp_path;
      // 根据路径获取索引
      const picIndex = this.addGoodsForm.pics.findIndex(
        (item) => item.pic == filePath
      );
      // 删除对应项
      this.addGoodsForm.pics.splice(picIndex, 1);
    },
    // 图片上传成功钩子
    uploadSuccess(res) {
      // 拼接提交数据的格式 pics数组每一项为一个对象
      const picInfo = {
        pic: res.data.tmp_path,
      };
      this.addGoodsForm.pics.push(picInfo);
    },
    // 添加商品
    addGoods() {
      this.$refs.addGoodsFormRef.validate(async validate => {
        if (!validate) return this.$message.warning("请填写必要选项");
        // 处理动态参数
        this.manyTableData.forEach((item) => {
          let attrData = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(" "),
          };
          this.addGoodsForm.attrs.push(attrData);
        });
        // 处理静态属性
        this.onlyTableData.forEach((item) => {
          let attrData = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals,
          };
          this.addGoodsForm.attrs.push(attrData);
        });

        // 由于级联选择器双向绑定必须是数组 不能对原有数据进行更改 所以克隆一个对象来操作以发起添加商品请求
        const addForm = _.cloneDeep(this.addGoodsForm);
        addForm.goods_cat = addForm.goods_cat.join(",");
        console.log(addForm);
        // 添加商品
        const { data: res } = await this.$axios.post("/goods", addForm);
        if (res.status != 201) return this.$message.error(res.msg);
        this.$message.success(res.msg);
        this.$router.push('/goods');
      });
    },
  },
  computed: {
    // 三级商品分类ID
    cateId() {
      return this.addGoodsForm.goods_cat.length == 3
        ? this.addGoodsForm.goods_cat[2]
        : null;
    },
  },
};
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}

.add-goods-btn {
  margin-top: 15px;
  float: right;
}
</style>