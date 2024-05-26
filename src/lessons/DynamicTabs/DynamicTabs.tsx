import { Container } from "@/components/Container";
import { DynamicTabsSlide } from "@/components/DynamicTabsSlide";
import { tabsList } from "@/lib/mock";
import { hitSlop } from "@/lib/reanimated";
import { colorShades, layout } from "@/lib/theme";
import { memo, useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import {
  FlatList,
  ScrollView,
  TouchableOpacity,
} from "react-native-gesture-handler";
import Animated, {
  MeasuredDimensions,
  SharedValue,
  measure,
  runOnJS,
  runOnUI,
  scrollTo,
  useAnimatedRef,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type TabsProps = {
  name: string;
  isActiveTabIndex: boolean;
  onActive: (measurements: MeasuredDimensions) => void;
};

const Tab = memo(({ name, isActiveTabIndex, onActive }: TabsProps) => {
  const tabRef = useAnimatedRef<View>();

  const sendMeasurements = () => {
    runOnUI(() => {
      "worklet";
      const measurements = measure(tabRef);
      runOnJS(onActive)(measurements);
    })();
  };

  useEffect(() => {
    // Send measurements when the active tab changes. This callback is necessary
    // because we need the tab measurements in order to animate the indicator
    // and the position of the scroll
    if (isActiveTabIndex) {
      sendMeasurements();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActiveTabIndex]);

  return (
    <View
      style={styles.tab}
      ref={tabRef}
      onLayout={() => {
        // This is needed because we can't send the initial render measurements
        // without hooking into `onLayout`. When the tab first mounts, we are
        // informing its parent and send the measurements.
        if (isActiveTabIndex) {
          sendMeasurements();
        }
      }}
    >
      <TouchableOpacity
        onPress={sendMeasurements}
        hitSlop={hitSlop}
        style={{ marginHorizontal: layout.spacing }}
      >
        <Text>{name}</Text>
      </TouchableOpacity>
    </View>
  );
});

// This component should receive the selected tab measurements as props
function Indicator({
  selectedTabMeasurements,
}: {
  selectedTabMeasurements: SharedValue<MeasuredDimensions | null>;
}) {
  const indicatorStyle = useAnimatedStyle(() => {
    if (!selectedTabMeasurements?.value) {
      return {};
    }

    const { x, width } = selectedTabMeasurements.value;

    return {
      left: withTiming(x),
      width: withTiming(width),
    };
  });

  return <Animated.View style={[styles.indicator, indicatorStyle]} />;
}

function DynamicTabs({
  selectedTabIndex = 0,
  onChangeTab,
}: {
  selectedTabIndex?: number;
  // Call this function when the tab changes
  // Don't forget to check if the function exists before calling it
  onChangeTab?: (index: number) => void;
}) {
  const tabMeasurements = useSharedValue<MeasuredDimensions | null>(null);

  const scrollViewRef = useAnimatedRef<ScrollView>();

  const scrollToTab = (index: number) => {
    runOnUI(() => {
      const scrollViewDimensions = measure(scrollViewRef);

      if (!scrollViewDimensions || !tabMeasurements.value) {
        return;
      }

      scrollTo(
        scrollViewRef,
        tabMeasurements.value.x -
          (scrollViewDimensions.width - tabMeasurements.value.width) / 2,
        0,
        true
      );

      // Here, you can send the selected tab index to the parent via a callback
      if (onChangeTab) {
        runOnJS(onChangeTab)(index);
      }
    })();
  };

  return (
    <ScrollView
      horizontal
      style={styles.scrollContainer}
      contentContainerStyle={styles.scrollViewContainer}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      ref={scrollViewRef}
    >
      {tabsList.map((tab, index) => (
        <Tab
          key={`tab-${tab}-${index}`}
          name={tab}
          isActiveTabIndex={index === selectedTabIndex}
          onActive={(measurements) => {
            tabMeasurements.value = measurements;
            scrollToTab(index);
          }}
        />
      ))}
      <Indicator selectedTabMeasurements={tabMeasurements} />
    </ScrollView>
  );
}

export function DynamicTabsLesson() {
  const [selectedTabIndex, setSelectedTabIndex] = useState(2);
  const flatListRef = useRef<FlatList>(null);

  const { width } = useWindowDimensions();

  return (
    <Container style={styles.container}>
      <DynamicTabs
        selectedTabIndex={selectedTabIndex}
        onChangeTab={(index) => {
          if (index !== selectedTabIndex) {
            flatListRef.current?.scrollToIndex({
              index,
              animated: true,
            });
          }
        }}
      />
      <FlatList
        ref={flatListRef}
        data={tabsList}
        keyExtractor={(item) => item}
        horizontal
        pagingEnabled
        initialScrollIndex={selectedTabIndex}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        onMomentumScrollEnd={(ev) => {
          setSelectedTabIndex(
            Math.floor(ev.nativeEvent.contentOffset.x / width)
          );
        }}
        renderItem={({ item }) => {
          return <DynamicTabsSlide item={item} />;
        }}
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 0,
  },
  scrollContainer: {
    flexGrow: 0,
  },
  indicator: {
    position: "absolute",
    backgroundColor: colorShades.purple.base,
    height: 4,
    borderRadius: 2,
    bottom: 0,
    left: 0,
    width: 100,
  },
  tab: {
    marginHorizontal: layout.spacing,
  },
  scrollViewContainer: {
    paddingVertical: layout.spacing * 2,
  },
});
