import { AnimatedText } from "@/components/AnimatedText";
import { Container } from "@/components/Container";
import { hitSlop } from "@/lib/reanimated";
import { colorShades, layout } from "@/lib/theme";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  clamp,
  interpolate,
  measure,
  useAnimatedRef,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { DefaultStyle } from "react-native-reanimated/lib/typescript/reanimated2/hook/commonTypes";

export function BalloonSliderLesson() {
  const x = useSharedValue(0);
  const knobScale = useSharedValue(0);
  const ballonSpringyX = useDerivedValue(() => {
    return withSpring(x.value);
  });

  const sliderRef = useAnimatedRef<View>();
  const sliderWidth = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .averageTouches(true)
    .onStart(() => {
      const sliderSize = measure(sliderRef);
      sliderWidth.value = sliderSize.width;

      knobScale.value = withSpring(1);
    })
    .onChange((ev) => {
      x.value = clamp((x.value += ev.changeX), 0, sliderWidth.value);
    })
    .onEnd(() => {
      knobScale.value = withSpring(0);
    });

  const knobStyle = useAnimatedStyle(() => {
    return {
      borderWidth: interpolate(
        knobScale.value,
        [0, 1],
        [layout.knobSize / 2, 2],
        Extrapolation.CLAMP
      ),
      transform: [
        {
          translateX: x.value,
        },
        {
          scale: knobScale.value + 1,
        },
      ],
    } as DefaultStyle;
  });

  const ballonStyle = useAnimatedStyle(() => {
    return {
      opacity: knobScale.value,
      transform: [
        {
          translateX: ballonSpringyX.value,
        },
        {
          scale: knobScale.value,
        },
        {
          translateY: interpolate(
            knobScale.value,
            [0, 1],
            [0, -layout.indicatorSize]
          ),
        },
        {
          rotate: `${Math.atan2(
            ballonSpringyX.value - x.value,
            layout.indicatorSize * 2
          )}rad`,
        },
      ],
    } as DefaultStyle;
  });

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: x.value,
    } as DefaultStyle;
  });

  const progress = useDerivedValue(() => {
    return interpolate(x.value, [0, sliderWidth.value], [0, 100]).toFixed(0);
  });

  return (
    <Container>
      <GestureDetector gesture={panGesture}>
        <View style={styles.slider} ref={sliderRef}>
          <Animated.View style={[styles.ballon, ballonStyle]}>
            <View style={styles.ballonTextContainer}>
              <AnimatedText text={progress} style={styles.ballonText} />
            </View>
          </Animated.View>
          <Animated.View
            style={[styles.progress, progressStyle]}
            hitSlop={hitSlop}
          />
          <Animated.View style={[styles.knob, knobStyle]} hitSlop={hitSlop} />
        </View>
      </GestureDetector>
    </Container>
  );
}

const styles = StyleSheet.create({
  knob: {
    width: layout.knobSize,
    height: layout.knobSize,
    borderRadius: layout.knobSize / 2,
    backgroundColor: "#fff",
    borderWidth: layout.knobSize / 2,
    borderColor: colorShades.purple.base,
    position: "absolute",
    left: -layout.knobSize / 2,
  },
  slider: {
    width: "75%",
    backgroundColor: colorShades.purple.light,
    height: 5,
    justifyContent: "center",
    borderRadius: 5,
  },
  progress: {
    height: 5,
    backgroundColor: colorShades.purple.dark,
    position: "absolute",
  },
  ballon: {
    alignItems: "center",
    justifyContent: "center",
    width: 4,
    height: layout.indicatorSize,
    bottom: -layout.knobSize / 2,
    borderRadius: 2,
    backgroundColor: colorShades.purple.base,
    position: "absolute",
  },
  ballonTextContainer: {
    width: 40,
    height: 60,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colorShades.purple.base,
    position: "absolute",
    top: -layout.knobSize,
  },
  ballonText: {
    color: "white",
    fontWeight: "600",
  },
});
