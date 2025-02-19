(function () {
  async function initFundDetailsNav(sname, fcode, ftype) {
    let dwjz//净值
    let syl//近一年
    let JZZZL//日涨幅
    let fundDetailsNav = document.querySelector('.fundDetailsNav')
    await axios.post(`/api/action?action_name=fundVarietieValuationDetail&FCODE=${fcode}`)
      .then(res => dwjz = res.data.Expansion.DWJZ)
      .catch(err => console.log(err))
    await axios.post(`/api/action?action_name=fundMNPeriodIncrease&FCODE=${fcode}&RANGE=1n`)
      .then(res => syl = res.data.Datas[4].syl)
      .catch(err => console.log(err))
    await axios.post(`/api/action?action_name=fundVPageDiagram&FCODE=${fcode}`)
      .then(res => JZZZL = res.data.data[res.data.data.length - 1].JZZZL)
      .catch(err => console.log(err))
    fundDetailsNav.innerHTML = `
    <div class="w-full flex justify-between">
      <h1 class="w-[70vw] h-[7vh] text-[5vw] font-[600] leading-[6vw]">${sname}</h1>
      <div class="w-[15vw] h-[7vw] flex justify-center items-center rounded-[10vw] bg-[#e5f3ff] text-[#1693ff]">诊断</div>
    </div>
    <div class="w-full mt-[1vw] flex">
      <span class="text-[#b6b6b6]">${fcode}</span>
      <span class="flex justify-center items-center bg-[#e5f3ff] text-[#1693ff] ml-[2vw] text-[3.5vw]">${ftype}</span>
      <span class="flex justify-center items-center bg-[#e5f3ff] text-[#1693ff] ml-[2vw] text-[3.5vw]">中高风险</span>
    </div>
    <div class="w-full flex pr-[10px] items-end justify-between mt-[3vw]">
      <div class="flex flex-col">
        <div class="flex ${parseFloat(JZZZL) > 0 ? 'text-[#ff0101]' : 'text-[#12b412]'}">
          <p class="text-[8vw]">${JZZZL}</p>
          <span class="translate-x-[1vw] translate-y-[3.2vw]">%</span>
        </div>
        <span class="text-[#b6b6b6] -translate-y-[1vw] text-[3.2vw]">日涨幅02-14</span>
      </div>
      <div class="flex flex-col">
        <p class="text-[5vw] -translate-y-[1.5vw]">${dwjz}</p>
        <span class="text-[#b6b6b6] -translate-y-[1vw] text-[3.2vw]">净值</span>
      </div>
      <div class="flex flex-col">
        <div class="flex ${parseFloat(syl) > 0 ? 'text-[#ff0101]' : 'text-[#12b412]'}">
          <p class="text-[6vw]">${syl}</p>
          <span class="translate-x-[1vw] translate-y-[3.2vw]">%</span>
        </div>
        <span class="text-[#b6b6b6] -translate-y-[1vw] text-[3.2vw]">近一年</span>
      </div>
    </div>
    `
  }
  async function initFundDetailsCanvas(fcode) {
    let dataValue
    await axios.post(`/api/action?action_name=fundVarietieValuationDetail&FCODE=${fcode}`)
      .then(res => dataValue = res.data.Datas)
      .catch(err => console.log(err))
    let time = dataValue.map(item => {
      return item.split(',')[1]
    })
    let timeValue = dataValue.map(item => {
      return item.split(',')[2]
    })
    let main = document.querySelector('#charts1')
    let myEcharts = echarts.init(main)
    let option = {
      grid: {
        show: true,
        left: 0,      // 左边界距离容器的距离
        right: 0,     // 右边界距离容器的距离
        top: 0,       // 上边界距离容器的距离
        bottom: 0,    // 下边界距离容器的距离
        containLabel: false // 是否包含坐标轴标签
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: time,
        axisLine: {
          show: false
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          show: true,
          interval: time.length / 4
        },
        axisLabel: {
          align: 'left',
          alignMaxLabel: 'right',
          interval: 0,
          customValues: ['09:30', '11:30', '15:00']
          // formatter: function (value, index) {
          //   console.log(index);
          //   if (index === 0 || index === time.length - 1 || index === Math.floor(time.length / 2)) {
          //     return value;
          //   } else {
          //     return '';
          //   }
          // }
        },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          inside: true,
          margin: 1,
          verticalAlignMaxLabel: 'top',
          verticalAlign: 'bottom'
        },
        splitNumber: 5 // 设置 y 轴的分割段数为 4
      },
      series: [
        {
          data: timeValue,
          type: 'line',
          areaStyle: {
            color: '#ebf1fd',
          },
          itemStyle: {
          },
          symbol: 'none' // 设置折点的标记类型为 'none'，隐藏折点的小圆圈
        },
      ]
    }
    myEcharts.setOption(option)
  }
  const BASE_URL = 'https://tiantian-fund-api.vercel.app'
  axios.defaults.baseURL = BASE_URL
  axios
    .post(`/api/action?action_name=fundSearchInfoByName&orderType=2&key=${location.search.slice(1)}&pageindex=1&pagesize=10`)
    .then(res => {
      let sname = res.data.data[0].shortname
      let fcode = res.data.data[0].fcode
      let ftype = res.data.data[0].ftype
      initFundDetailsNav(sname, fcode, ftype)
      initFundDetailsCanvas(fcode)
    })
    .catch(err => {
      console.log(err);
    })
})()