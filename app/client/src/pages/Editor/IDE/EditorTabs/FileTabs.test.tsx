import React from "react";
import { fireEvent, render } from "test/testUtils";
import FileTabs from "./FileTabs";
import type { EntityItem } from "@appsmith/entities/IDE/constants";
import { PluginType } from "entities/Action";

const featureFlags = {
  release_ide_tabs_revamp_enabled: true,
};

describe("FileTabs", () => {
  const mockTabs: EntityItem[] = [
    { key: "1", title: "File 1", type: PluginType.JS },
    { key: "2", title: "File 2", type: PluginType.JS },
    { key: "3", title: "File 3", type: PluginType.JS },
    { key: "4", title: "File 4", type: PluginType.JS },
  ];

  const mockNavigateToTab = jest.fn();
  const mockOnClose = jest.fn();

  it("renders tabs correctly", () => {
    const { getByTestId, getByText } = render(
      <FileTabs
        navigateToTab={mockNavigateToTab}
        onClose={mockOnClose}
        tabs={mockTabs}
      />,
      {
        featureFlags: featureFlags,
      },
    );

    const editorTabsContainer = getByTestId("t--editor-tabs");
    expect(editorTabsContainer).not.toBeNull();

    // Check if each tab is rendered with correct content
    mockTabs.forEach((tab) => {
      const tabElement = getByTestId(`t--ide-tab-${tab.title}`);
      expect(tabElement).not.toBeNull();

      const tabTitleElement = getByText(tab.title);
      expect(tabTitleElement).not.toBeNull();
    });
  });

  it("do not render close button if feature flag is off", () => {
    featureFlags.release_ide_tabs_revamp_enabled = false;
    const { getByTestId, queryByTestId } = render(
      <FileTabs
        navigateToTab={mockNavigateToTab}
        onClose={mockOnClose}
        tabs={mockTabs}
      />,
      {
        featureFlags: featureFlags,
      },
    );

    mockTabs.forEach((tab) => {
      const tabElement = getByTestId(`t--ide-tab-${tab.title}`);
      expect(tabElement).not.toBeNull();

      expect(queryByTestId("t--tab-close-btn")).toBeFalsy();
    });
  });

  it("check tab click", () => {
    featureFlags.release_ide_tabs_revamp_enabled = false;
    const { getByTestId } = render(
      <FileTabs
        navigateToTab={mockNavigateToTab}
        onClose={mockOnClose}
        tabs={mockTabs}
      />,
      {
        featureFlags: featureFlags,
      },
    );
    const tabElement = getByTestId(`t--ide-tab-${mockTabs[0].title}`);
    fireEvent.click(tabElement);

    expect(mockNavigateToTab).toHaveBeenCalledWith(mockTabs[0]);
  });

  it("check for close click", () => {
    featureFlags.release_ide_tabs_revamp_enabled = true;
    const { getByTestId } = render(
      <FileTabs
        navigateToTab={mockNavigateToTab}
        onClose={mockOnClose}
        tabs={mockTabs}
      />,
      {
        featureFlags: featureFlags,
      },
    );
    const tabElement = getByTestId(`t--ide-tab-${mockTabs[1].title}`);
    const closeElement = tabElement.querySelector(
      "[data-testid='t--tab-close-btn']",
    ) as HTMLElement;
    fireEvent.click(closeElement);
    expect(mockOnClose).toHaveBeenCalledWith(mockTabs[1].key);
  });
});
