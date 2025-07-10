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
  background: ${({ theme }) =>
    `linear-gradient(90deg, ${theme.colors.background} 25%, ${theme.colors.key} 50%, ${theme.colors.background} 75%)`};
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
