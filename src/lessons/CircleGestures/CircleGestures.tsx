import { Container } from "@/components/Container";
import { hitSlop } from "@/lib/reanimated";
import { colorShades, layout } from "@/lib/theme";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { DefaultStyle } from "react-native-reanimated/lib/typescript/reanimated2/hook/commonTypes";

export function CircleGesturesLesson() {
  const isInteracting = useSharedValue(false);
  const scale = useDerivedValue(() => withSpring(isInteracting.value ? 2 : 1));
  const x = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      isInteracting.value = true;
    })
    .onChange((ev) => {
      x.value += ev.changeX;
    })
    .onEnd(() => {
      isInteracting.value = false;
    })
    .onFinalize(() => {
      x.value = withSpring(0);
    });

  const knobAnimatedStyle = useAnimatedStyle(
    () =>
      ({
        borderWidth: interpolate(
          scale.value,
          [1, 2],
          [layout.knobSize / 2, 2],
          Extrapolation.CLAMP
        ),
        transform: [
          {
            translateX: x.value,
          },
          {
            scale: scale.value,
          },
        ],
      } as DefaultStyle)
  );

  return (
    <Container>
      <View style={{ flex: 1, justifyContent: "center" }}>
        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[styles.knob, knobAnimatedStyle]}
            hitSlop={hitSlop}
          />
        </GestureDetector>
      </View>
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
});
