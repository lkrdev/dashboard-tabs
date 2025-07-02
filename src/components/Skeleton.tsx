import { Box, BoxProps } from "@looker/components";
import React from "react";
import styled from "styled-components";

const SkeletonContainer = styled(Box)<{ show: boolean }>`
  visibility: ${({ show }) => (show ? "visible" : "hidden")};
`;

const SkeletonElement = styled.div<{
  width?: string;
  height?: string;
}>`
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeletonLoading 1.5s infinite;
  border-radius: 2px;
  width: ${({ width }) => width || "100%"};
  height: ${({ height }) => height || "16px"};
  margin-bottom: 8px;

  @keyframes skeletonLoading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`;

interface SkeletonProps extends BoxProps {
  show?: boolean;
  width?: string;
  height?: string;
  children?: React.ReactNode;
}

export default ({
  show = true,
  width,
  height,
  children,
  ...props
}: SkeletonProps) => {
  return (
    <SkeletonContainer show={show} {...props}>
      <SkeletonElement width={width} height={height}>
        {children}
      </SkeletonElement>
    </SkeletonContainer>
  );
};
