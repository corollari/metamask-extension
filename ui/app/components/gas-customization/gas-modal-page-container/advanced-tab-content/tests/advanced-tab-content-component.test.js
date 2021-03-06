import React from 'react'
import assert from 'assert'
import shallow from '../../../../../../lib/shallow-with-context'
import sinon from 'sinon'
import AdvancedTabContent from '../advanced-tab-content.component.js'

import GasPriceChart from '../../../gas-price-chart'
import Loading from '../../../../loading-screen'

const propsMethodSpies = {
  updateCustomGasPrice: sinon.spy(),
  updateCustomGasLimit: sinon.spy(),
}

sinon.spy(AdvancedTabContent.prototype, 'renderGasEditRow')
sinon.spy(AdvancedTabContent.prototype, 'gasInput')
sinon.spy(AdvancedTabContent.prototype, 'renderGasEditRows')
sinon.spy(AdvancedTabContent.prototype, 'renderDataSummary')

describe('AdvancedTabContent Component', function () {
  let wrapper

  beforeEach(() => {
    wrapper = shallow(<AdvancedTabContent
      updateCustomGasPrice={propsMethodSpies.updateCustomGasPrice}
      updateCustomGasLimit={propsMethodSpies.updateCustomGasLimit}
      customGasPrice={11}
      customGasLimit={23456}
      timeRemaining={21500}
      totalFee={'$0.25'}
      insufficientBalance={false}
    />, { context: { t: (str1, str2) => str2 ? str1 + str2 : str1 } })
  })

  afterEach(() => {
    propsMethodSpies.updateCustomGasPrice.resetHistory()
    propsMethodSpies.updateCustomGasLimit.resetHistory()
    AdvancedTabContent.prototype.renderGasEditRow.resetHistory()
    AdvancedTabContent.prototype.gasInput.resetHistory()
    AdvancedTabContent.prototype.renderGasEditRows.resetHistory()
    AdvancedTabContent.prototype.renderDataSummary.resetHistory()
  })

  describe('render()', () => {
    it('should render the advanced-tab root node', () => {
      assert(wrapper.hasClass('advanced-tab'))
    })

    it('should render the expected four children of the advanced-tab div', () => {
      const advancedTabChildren = wrapper.children()
      assert.equal(advancedTabChildren.length, 2)

      assert(advancedTabChildren.at(0).hasClass('advanced-tab__transaction-data-summary'))
      assert(advancedTabChildren.at(1).hasClass('advanced-tab__fee-chart'))

      const feeChartDiv = advancedTabChildren.at(1)

      assert(feeChartDiv.childAt(0).hasClass('advanced-tab__gas-edit-rows'))
      assert(feeChartDiv.childAt(1).hasClass('advanced-tab__fee-chart__title'))
      assert(feeChartDiv.childAt(2).is(GasPriceChart))
      assert(feeChartDiv.childAt(3).hasClass('advanced-tab__fee-chart__speed-buttons'))
    })

    it('should render a loading component instead of the chart if gasEstimatesLoading is true', () => {
      wrapper.setProps({ gasEstimatesLoading: true })
      const advancedTabChildren = wrapper.children()
      assert.equal(advancedTabChildren.length, 2)

      assert(advancedTabChildren.at(0).hasClass('advanced-tab__transaction-data-summary'))
      assert(advancedTabChildren.at(1).hasClass('advanced-tab__fee-chart'))

      const feeChartDiv = advancedTabChildren.at(1)

      assert(feeChartDiv.childAt(0).hasClass('advanced-tab__gas-edit-rows'))
      assert(feeChartDiv.childAt(1).hasClass('advanced-tab__fee-chart__title'))
      assert(feeChartDiv.childAt(2).is(Loading))
      assert(feeChartDiv.childAt(3).hasClass('advanced-tab__fee-chart__speed-buttons'))
    })

    it('should call renderDataSummary with the expected params', () => {
      assert.equal(AdvancedTabContent.prototype.renderGasEditRows.callCount, 1)
      const renderDataSummaryArgs = AdvancedTabContent.prototype.renderDataSummary.getCall(0).args
      assert.deepEqual(renderDataSummaryArgs, ['$0.25', 21500])
    })

    it('should call renderGasEditRows with the expected params', () => {
      assert.equal(AdvancedTabContent.prototype.renderGasEditRows.callCount, 1)
      const renderGasEditRowArgs = AdvancedTabContent.prototype.renderGasEditRows.getCall(0).args
      assert.deepEqual(renderGasEditRowArgs, [
        11, propsMethodSpies.updateCustomGasPrice, 23456, propsMethodSpies.updateCustomGasLimit, false,
      ])
    })
  })

  describe('renderDataSummary()', () => {
    let dataSummary

    beforeEach(() => {
      dataSummary = shallow(wrapper.instance().renderDataSummary('mockTotalFee', 'mockMsRemaining'))
    })

    it('should render the transaction-data-summary root node', () => {
      assert(dataSummary.hasClass('advanced-tab__transaction-data-summary'))
    })

    it('should render titles of the data', () => {
      const titlesNode = dataSummary.children().at(0)
      assert(titlesNode.hasClass('advanced-tab__transaction-data-summary__titles'))
      assert.equal(titlesNode.children().at(0).text(), 'newTransactionFee')
      assert.equal(titlesNode.children().at(1).text(), '~transactionTime')
    })

    it('should render the data', () => {
      const dataNode = dataSummary.children().at(1)
      assert(dataNode.hasClass('advanced-tab__transaction-data-summary__container'))
      assert.equal(dataNode.children().at(0).text(), 'mockTotalFee')
      assert(dataNode.children().at(1).hasClass('time-remaining'))
      assert.equal(dataNode.children().at(1).text(), 'mockMsRemaining')
    })
  })

  describe('renderGasEditRow()', () => {
    let gasEditRow

    beforeEach(() => {
      AdvancedTabContent.prototype.gasInput.resetHistory()
      gasEditRow = shallow(wrapper.instance().renderGasEditRow(
        'mockLabelKey', 'argA', 'argB'
      ))
    })

    it('should render the gas-edit-row root node', () => {
      assert(gasEditRow.hasClass('advanced-tab__gas-edit-row'))
    })

    it('should render a label and an input', () => {
      const gasEditRowChildren = gasEditRow.children()
      assert.equal(gasEditRowChildren.length, 2)
      assert(gasEditRowChildren.at(0).hasClass('advanced-tab__gas-edit-row__label'))
      assert(gasEditRowChildren.at(1).hasClass('advanced-tab__gas-edit-row__input-wrapper'))
    })

    it('should render the label key and info button', () => {
      const gasRowLabelChildren = gasEditRow.children().at(0).children()
      assert.equal(gasRowLabelChildren.length, 2)
      assert(gasRowLabelChildren.at(0), 'mockLabelKey')
      assert(gasRowLabelChildren.at(1).hasClass('fa-info-circle'))
    })

    it('should call this.gasInput with the correct args', () => {
      const gasInputSpyArgs = AdvancedTabContent.prototype.gasInput.args
      assert.deepEqual(gasInputSpyArgs[0], [ 'argA', 'argB' ])
    })
  })

  describe('renderGasEditRows()', () => {
    let gasEditRows
    let tempOnChangeGasLimit

    beforeEach(() => {
      tempOnChangeGasLimit = wrapper.instance().onChangeGasLimit
      wrapper.instance().onChangeGasLimit = () => 'mockOnChangeGasLimit'
      AdvancedTabContent.prototype.renderGasEditRow.resetHistory()
      gasEditRows = shallow(wrapper.instance().renderGasEditRows(
        'mockGasPrice',
        () => 'mockUpdateCustomGasPriceReturn',
        'mockGasLimit',
        () => 'mockUpdateCustomGasLimitReturn',
        false
      ))
    })

    afterEach(() => {
      wrapper.instance().onChangeGasLimit = tempOnChangeGasLimit
    })

    it('should render the gas-edit-rows root node', () => {
      assert(gasEditRows.hasClass('advanced-tab__gas-edit-rows'))
    })

    it('should render two rows', () => {
      const gasEditRowsChildren = gasEditRows.children()
      assert.equal(gasEditRowsChildren.length, 2)
      assert(gasEditRowsChildren.at(0).hasClass('advanced-tab__gas-edit-row'))
      assert(gasEditRowsChildren.at(1).hasClass('advanced-tab__gas-edit-row'))
    })

    it('should call this.renderGasEditRow twice, with the expected args', () => {
      const renderGasEditRowSpyArgs = AdvancedTabContent.prototype.renderGasEditRow.args
      assert.equal(renderGasEditRowSpyArgs.length, 2)
      assert.deepEqual(renderGasEditRowSpyArgs[0].map(String), [
        'gasPrice', 'mockGasPrice', () => 'mockUpdateCustomGasPriceReturn', 'mockGasPrice', false, true,
      ].map(String))
      assert.deepEqual(renderGasEditRowSpyArgs[1].map(String), [
        'gasLimit', 'mockGasLimit', () => 'mockOnChangeGasLimit', 'mockGasLimit', false,
      ].map(String))
    })
  })

  describe('infoButton()', () => {
    let infoButton

    beforeEach(() => {
      AdvancedTabContent.prototype.renderGasEditRow.resetHistory()
      infoButton = shallow(wrapper.instance().infoButton(() => 'mockOnClickReturn'))
    })

    it('should render the i element', () => {
      assert(infoButton.hasClass('fa-info-circle'))
    })

    it('should pass the onClick argument to the i tag onClick prop', () => {
      assert(infoButton.props().onClick(), 'mockOnClickReturn')
    })
  })

  describe('gasInput()', () => {
    let gasInput

    beforeEach(() => {
      AdvancedTabContent.prototype.renderGasEditRow.resetHistory()
      gasInput = shallow(wrapper.instance().gasInput(
        321,
        value => value + 7,
        0,
        false,
        8
      ))
    })

    it('should render the input-wrapper root node', () => {
      assert(gasInput.hasClass('advanced-tab__gas-edit-row__input-wrapper'))
    })

    it('should render two children, including an input', () => {
      assert.equal(gasInput.children().length, 2)
      assert(gasInput.children().at(0).hasClass('advanced-tab__gas-edit-row__input'))
    })

    it('should pass the correct value min and precision props to the input', () => {
      const inputProps = gasInput.find('input').props()
      assert.equal(inputProps.min, 0)
      assert.equal(inputProps.value, 321)
    })

    it('should call the passed onChange method with the value of the input onChange event', () => {
      const inputOnChange = gasInput.find('input').props().onChange
      assert.equal(inputOnChange({ target: { value: 8} }), 15)
    })

    it('should have two input arrows', () => {
      const upArrow = gasInput.find('.fa-angle-up')
      assert.equal(upArrow.length, 1)
      const downArrow = gasInput.find('.fa-angle-down')
      assert.equal(downArrow.length, 1)
    })

    it('should call onChange with the value incremented decremented when its onchange method is called', () => {
      gasInput = shallow(wrapper.instance().gasInput(
        321,
        value => value + 7,
        0,
        8,
        false
      ))
      const upArrow = gasInput.find('.advanced-tab__gas-edit-row__input-arrows__i-wrap').at(0)
      assert.equal(upArrow.props().onClick(), 329)
      const downArrow = gasInput.find('.advanced-tab__gas-edit-row__input-arrows__i-wrap').at(1)
      assert.equal(downArrow.props().onClick(), 327)
    })
  })

})
