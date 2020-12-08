import React from "react";
import { shallow, mount } from "enzyme";
import RewardDelete from "./request-reward-delete";

describe("<Iou />", () => {
  it("should render correctly", () => {
    const wrapper = shallow(
      <RewardDelete
        requestID="1"
        rewardID="1"
        refreshTable={() => {
          return "substitute test function";
        }}
        closeModal={() => {
          return "substitute test function";
        }}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it("should call the delete reward API endpoint when clicked", () => {
    const spy = jest.spyOn(RewardDelete.prototype, "deleteReward");
    const wrapper = mount(
      <RewardDelete
        requestID="1"
        rewardID="1"
        refreshTable={() => {
          return "substitute test function";
        }}
        closeModal={() => {
          return "substitute test function";
        }}
      />
    );
    wrapper.find("#requestItem").simulate("click");
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
