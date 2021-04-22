<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input v-model="queryInfo.query" placeholder="请输入内容" clearable @clear="getOrderList">
            <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- 表格区域 -->
      <el-table :data="orderList" border stripe>
        <el-table-column
          type="index"
          label="#"
          align="center"
        ></el-table-column>
        <el-table-column
          label="订单编号"
          prop="order_number"
          header-align="center"
        ></el-table-column>
        <el-table-column
          label="订单价格"
          prop="order_price"
          align="center"
          width="100"
        ></el-table-column>
        <el-table-column
          label="是否付款"
          prop="order_pay"
          align="center"
          width="100"
        >
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.order_pay == '1'"
              >已付款</el-tag
            >
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="是否发货"
          prop="is_send"
          align="center"
          width="100"
        ></el-table-column>
        <el-table-column
          label="下单时间"
          prop="create_time"
          align="center"
          width="160"
        >
          <template slot-scope="scope">
            {{ scope.row.create_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="120">
          <template>
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="showAddressDialog"
            ></el-button>
            <el-button
              size="mini"
              type="success"
              icon="el-icon-location"
              @click="showProgressDialog"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页控件 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 20, 50]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 修改地址对话框 -->
    <el-dialog
      title="修改地址"
      :visible.sync="addressDialogVisible"
      width="50%"
      @close="addressDialogClosed"
    >
      <el-form
        :model="addressForm"
        :rules="addressFormRules"
        ref="addressFormRef"
        label-width="100px"
      >
        <el-form-item label="省市区/县" prop="address">
          <el-cascader
            v-model="addressForm.address"
            :options="cityData"
            :props="addressCascaderProp"
            @change="handleAddressChange"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="detail_address">
          <el-input v-model="addressForm.detail_address"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer">
        <el-button @click="addressDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressDialogVisible = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>

    <!-- 物流进度对话框 -->
    <el-dialog
      title="物流进度"
      :visible.sync="progressDialogVisible"
      width="50%"
    >
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in progressInfo"
          :key="index"
          :timestamp="activity.time"
        >
          {{ activity.context }}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import cityData from "./citys";
import progressInfo from "./progress";

export default {
  created() {
    this.getOrderList();
  },
  data() {
    return {
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 5,
      },
      total: 0,
      orderList: [],
      addressDialogVisible: false,
      addressForm: {
        address: [],
        detail_address: "",
      },
      addressFormRules: {
        address: [
          { required: true, message: "请选择省市区/县", trigger: "blur" },
        ],
        detail_address: [
          { required: true, message: "请填写详细地址", trigger: "blur" },
        ],
      },
      // 省市区县数据
      cityData,
      addressCascaderProp: {
        expandTrigger: "hover",
      },
      progressDialogVisible: false,
      progressInfo: progressInfo.data,
    };
  },
  methods: {
    async getOrderList() {
      const { data: res } = await this.$axios.get("/orders", {
        params: this.queryInfo,
      });
      if (res.status != 200) return this.$message.error(res.msg);
      this.total = res.data.total;
      this.orderList = res.data.goods;
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getOrderList();
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getOrderList();
    },
    showAddressDialog() {
      this.addressDialogVisible = true;
    },
    // 级联选择器改变触发事件函数
    handleAddressChange() {},
    addressDialogClosed() {
      this.$refs.addressFormRef.resetFields();
    },
    async showProgressDialog() {
      // 订单物流信息只有测试数据 此接口不能使用 使用文件导入模式仅供练习
      // const res = await this.$axios.get('/kuaidi/1106975712662')
      this.progressDialogVisible = true;
    },
  },
};
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>