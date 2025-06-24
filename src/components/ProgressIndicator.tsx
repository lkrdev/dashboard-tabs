import { Box, BoxProps } from "@looker/components";
import React from "react";
import styled from "styled-components";

const ProgressBarContainer = styled(Box)<{ show: boolean }>`
  height: 2px;
  width: 100%;
  border-radius: 2px;
  background: ${({ theme }) => theme?.colors?.key || "#f5f5f5"};
  overflow: hidden;
  visibility: ${({ show }) => (show ? "visible" : "hidden")};
`;

const ProgressBarIndeterminate = styled.div`
  height: 100%;
  width: 100%;
  border-radius: 2px;
  background: linear-gradient(90deg, #4285f4 30%, #a7c7f9 100%);
  animation: progressBarIndeterminate 1.5s linear infinite;
  @keyframes progressBarIndeterminate {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
`;

export default ({ show, ...props }: { show: boolean } & BoxProps) => {
  return (
    <ProgressBarContainer show={show} {...props}>
      <ProgressBarIndeterminate />
    </ProgressBarContainer>
  );
};
