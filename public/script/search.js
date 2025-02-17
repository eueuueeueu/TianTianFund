(function () {
  function controlSearchOriginDisplay() {
    const search_history = document.querySelector('#search_history')
    const hot_search_fund = document.querySelector('#hot_search_fund')
    return {
      hidden: function () {
        search_history.classList.add('hidden')
        hot_search_fund.classList.add('hidden')
      },
      block: function () {
        search_history.classList.remove('hidden')
        hot_search_fund.classList.remove('hidden')
      }
    }
  }
  let controlDisplay = controlSearchOriginDisplay()
  function initSearchHistory(arr) {
    if (arr === undefined) return
    let search_history = document.querySelector('#search_history')
    search_history.innerHTML = ''
    let search_item = createElement('div', { className: 'flex justify-between py-[2vw] items-center' })
    let search_item_h1 = createElement('h1', { className: 'text-[5.5vw] mb-[1vw]' }, '搜索历史')
    let search_item_i = createElement('i', { className: 'clear_History' }, 'E')
    search_item_i.addEventListener('click', () => {
      store.clear()
      search_history.innerHTML = ''
    })
    search_item.appendChild(search_item_h1)
    search_item.appendChild(search_item_i)
    search_history.appendChild(search_item)
    let div = createElement('div', { className: 'w-full flex flex-wrap' })
    arr.forEach(item => {
      let div_item = createElement('div', { className: 'search_history_item px-[4vw] h-[10vw] bg-[#f5f5f5] rounded-[10vw] text-center leading-[10vw] mx-[1vw] my-[1vw]' }, `${item}`)
      div.appendChild(div_item)
    })
    div.addEventListener('click', e => {
      if (e.target.className === 'search_history_item px-[4vw] h-[10vw] bg-[#f5f5f5] rounded-[10vw] text-center leading-[10vw] mx-[1vw] my-[1vw]') {
        let value = e.target.innerText
        document.querySelector('#search').value = value
        controlDisplay.hidden()
        axiosFund(value)
        setLocalStorage(value)
      }
    })
    search_history.appendChild(div)
  }
  function setLocalStorage(value) {
    console.log(store.get('setStorage'));//第一次是undefined
    let arr = store.get('setStorage') ?? []
    arr.unshift(value)
    store.set('setStorage', arr = [...new Set(arr)])
    initSearchHistory(arr)
  }
  function initSearchContent(data, value) {
    let fragment = document.createDocumentFragment()
    let tab = createElement('div', { className: 'flex justify-around border-b-1 border-b-gray-300' })
    let all = createElement('div', { className: 'h-[8vh] leading-[8vh] text-[4.5vw] text-[#ff581c] border-b-2', id: 'item1' }, '全部')
    let fund = createElement('div', { className: 'h-[8vh] leading-[8vh] text-[4.5vw]', id: 'item2' }, '基金')
    let firmOffer = createElement('div', { className: 'h-[8vh] leading-[8vh] text-[4.5vw]', id: 'item3' }, '实盘')
    tab.appendChild(all)
    tab.appendChild(fund)
    tab.appendChild(firmOffer)
    tab.addEventListener('click', e => {
      if (e.target.id.slice(0, -1) === 'item') {
        let target = e.target.className;
        let search = 'text-[#ff581c] border-b-2'
        if (!target.includes(search)) {
          target = all.className
          if (target.includes(search)) all.className = 'h-[8vh] leading-[8vh] text-[4.5vw]'
          target = fund.className
          if (target.includes(search)) fund.className = 'h-[8vh] leading-[8vh] text-[4.5vw]'
          target = firmOffer.className
          if (target.includes(search)) firmOffer.className = 'h-[8vh] leading-[8vh] text-[4.5vw]'
          e.target.className = 'h-[8vh] leading-[8vh] text-[4.5vw] text-[#ff581c] border-b-2'
        }
      }
    })
    let dataBody = createElement('div', { className: 'px-[3vw]' })
    let dataBody_h1 = createElement('h1', { className: 'text-[5vw] w-full h-[7vh] leading-[7vh]' }, '基金')
    let dataBody_content = createElement('div', { className: 'w-full h-[77vh] wrapper1 overflow-hidden' })
    let dataBody_content_item = createElement('div', {})
    data.forEach(item => {
      let item_name = item.shortname
      let item_code = item.fcode
      let item_type = item.ftype
      let yearAddCount
      axios
        .post(`/api/action?action_name=fundMNPeriodIncrease&FCODE=${item_code}&RANGE=1n`)
        .then(result => {
          yearAddCount = result.data.Datas[4].syl

          let div = createElement('div', { className: 'w-full h-[15vw] py-[1vh] flex flex-col' },
            `
            <div class="w-full h-1/2 flex justify-between">
              <span class="w-[80vw] whitespace-nowrap overflow-hidden text-ellipsis">${item_name}</span>
              <span class="text-[#ff0101]">${yearAddCount}%</span>
            </div>
            <div class="w-full h-1/2 flex justify-between">
              <div class="flex items-center">
                <span>${item_code}</span>
                <span class="inline-block ml-[2vw] bg-[#edf6ff] text-[#54aaff] text-[12px] p-[.3vw] rounded-[10vw]">${item_type}</span>
              </div>
              <span class="text-[#a9a9a9] text-[4vw]">近1年</span>
            </div>
        `)
          dataBody_content_item.appendChild(div)
          nextTick(() => bs.refresh())
        })
        .catch(err => {
          console.log(err);
        })
    });
    dataBody_content.appendChild(dataBody_content_item)
    dataBody.appendChild(dataBody_h1)
    dataBody.appendChild(dataBody_content)
    fragment.appendChild(tab)
    fragment.appendChild(dataBody)
    let search_block = document.querySelector('#search_block')
    search_block.innerHTML = ''
    search_block.appendChild(fragment)
    let bs = new BScroll('.wrapper1', {
      click: true
    })
    dataBody_content_item.addEventListener('click', () => {
      setLocalStorage(value)
      location.href = './FundDetails.html'
    })
  }
  function axiosFund(key) {
    const BASE_URL = 'https://tiantian-fund-api.vercel.app'
    axios.defaults.baseURL = BASE_URL
    axios
      .post(`/api/action?action_name=fundSearchInfoByName&orderType=2&key=${key}&pageindex=1&pagesize=10`)
      .then(result => {
        initSearchContent(result.data.data, key)
      })
      .catch(err => {
        console.log(err);
      })
  }
  function initSearch() {
    initSearchHistory(store.get('setStorage')) // 根据Local storage来渲染搜索历史
    const search = document.querySelector('#search')
    const search_block = document.querySelector('#search_block')
    search.addEventListener('input', _.debounce(function () {
      if (search.value.trim() === '') {
        search_block.innerHTML = ''
        controlDisplay.block()
      } else {
        controlDisplay.hidden()
        axiosFund(search.value)
      }
    }, 300))
  }
  initSearch()
})()