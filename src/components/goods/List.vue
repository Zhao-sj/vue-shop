<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getGoodsList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getGoodsList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- 表格区域 -->
      <el-table :data="goodList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column
          prop="goods_price"
          label="商品价格(元)"
          width="105"
        ></el-table-column>
        <el-table-column
          prop="goods_weight"
          label="商品重量"
          width="80"
        ></el-table-column>
        <el-table-column label="创建时间" width="160">
          <template slot-scope="scope">
            <!-- 使用过滤器格式化时间 -->
            {{ scope.row.add_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="showEditDialog(scope.row.goods_id)"
            ></el-button>
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="removeGoodsById(scope.row.goods_id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 20, 50, 100]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      >
      </el-pagination>
    </el-card>

    <!-- 修改商品对话框 -->
    <el-dialog title="修改商品" :visible.sync="editDialogVisible" width="50%">
      <el-form
        :model="editGoodsForm"
        :rules="editGoodsFormRules"
        ref="editGoodsFormRef"
        label-width="100px"
      >
        <el-form-item label="商品名称" prop="goods_name">
          <el-input
            type="textarea"
            v-model="editGoodsForm.goods_name"
          ></el-input>
        </el-form-item>
        <el-form-item label="商品价格" prop="goods_price">
          <el-input v-model="editGoodsForm.goods_price"></el-input>
        </el-form-item>
        <el-form-item label="商品数量" prop="goods_number">
          <el-input v-model="editGoodsForm.goods_number"></el-input>
        </el-form-item>
        <el-form-item label="商品重量" prop="goods_weight">
          <el-input v-model="editGoodsForm.goods_weight"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="editGoods">确 定</el-button>
        <el-button @click="editDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 5,
      },
      goodList: [],
      total: 0,
      editDialogVisible: false,
      editGoodsForm: {},
      editGoodsFormRules: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" },
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" },
        ],
        goods_number: [
          { required: true, message: "请输入商品数量", trigger: "blur" },
        ],
        goods_weight: [
          { required: true, message: "请输入商品重量", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.getGoodsList();
  },
  methods: {
    // 获取商品列表数据
    async getGoodsList() {
      const { data: res } = await this.$axios.get("/goods", {
        params: this.queryInfo,
      });
      if (res.status != 200) return this.$message.error(res.msg);
      this.goodList = res.data.goods;
      this.total = res.data.total;
    },
    handleSizeChange(pagesize) {
      this.queryInfo.pagesize = pagesize;
      this.getGoodsList();
    },
    handleCurrentChange(current) {
      this.queryInfo.pagenum = current;
      this.getGoodsList();
    },
    async showEditDialog(goodsId) {
      // 根据ID查询商品
      const { data: res } = await this.$axios.get(`/goods/${goodsId}`);
      if (res.status != 200) return this.$message.error(res.msg);
      this.editGoodsForm = res.data;
      this.editDialogVisible = true;
    },
    // 编辑商品
    editGoods() {
      this.$refs.editGoodsFormRef.validate(async (validate) => {
        if (!validate) return;
        console.log(this.editGoodsForm);
        const { data: res } = await this.$axios.put(
          `/goods/${this.editGoodsForm.goods_id}`,
          {
            params: this.editGoodsForm,
          }
        );
        console.log(res)
        if (res.status != 200) return this.$message.error('后端有问题，总是提示商品名称不能为空');
        this.getGoodsList();
        this.editDialogVisible = false;
      });
    },
    // 根据商品ID删除数据
    async removeGoodsById(goodsId) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该商品, 是否继续?",
        "提示",
        {
          confirmButtonText: "删除",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);

      if (confirmResult != "confirm") return;
      const { data: res } = await this.$axios.delete(`/goods/${goodsId}`);
      if (res.status != 200) return this.$message.error(res.msg);
      this.$message.success(res.msg);
      this.getGoodsList();
    },
    // 跳转到添加商品组件
    goAddPage() {
      this.$router.push("/addgoods");
    },
  },
};
</script>

<style>
</style>