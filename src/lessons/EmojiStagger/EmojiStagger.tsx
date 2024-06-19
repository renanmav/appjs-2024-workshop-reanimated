import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { Overlay } from "@/components/ChatOverlay";
import { useChat } from "@/components/ChatProvider";
import type { MessageType } from "@/lib/mock";
import { colors } from "@/lib/theme";
import { useCallback, useState } from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  FadeInDown,
  FadeInRight,
  FadeOutDown,
  ZoomIn,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface Props {
  message: MessageType;
}

const emojis = ["👍", "👎", "😂", "😢", "😡", "😲"];

export function EmojiStaggerLesson({ message }: Props) {
  const { currentPopupId, setCurrentPopupId } = useChat();

  const [emojiReaction, setEmojiReaction] = useState<string>();

  const handleEmojiPress = useCallback(
    (emoji: string) => {
      setEmojiReaction(emojiReaction === emoji ? undefined : emoji);
      setCurrentPopupId(undefined);
    },
    [emojiReaction]
  );

  const pressed = useSharedValue(false);

  const longPress = Gesture.LongPress()
    .onBegin(() => {
      pressed.value = true;
    })
    .onStart(() => {
      runOnJS(setCurrentPopupId)(message.id);
    })
    .onFinalize(() => {
      pressed.value = false;
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withTiming(pressed.value ? 0.96 : 1, { duration: 200 }),
      },
    ],
  }));

  return (
    <View>
      <GestureDetector gesture={longPress}>
        <Animated.View
          style={[
            styles.message,
            message.from === "me" ? styles.messageMe : styles.messageThem,
            animatedStyle,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              message.from === "me"
                ? styles.messageTextMe
                : styles.messageTextThem,
            ]}
          >
            {message.message}
          </Text>
        </Animated.View>
      </GestureDetector>

      {emojiReaction && (
        <Animated.Text
          entering={FadeInDown.delay(200).duration(200)}
          exiting={FadeOutDown}
          style={[
            styles.emojiReaction,
            message.from === "me"
              ? styles.emojiReactionMe
              : styles.emojiReactionThem,
          ]}
        >
          {emojiReaction}
        </Animated.Text>
      )}

      {currentPopupId === message.id && (
        <View style={styles.emojiPopupContainer}>
          <Animated.View
            entering={FadeInDown.duration(200)}
            exiting={FadeOutDown}
            style={[styles.emojiPopupWrapper, styles.shadow]}
          >
            <Animated.View entering={FadeInRight} style={styles.emojiPopup}>
              {emojis.map((emoji, i) => (
                <Pressable key={emoji} onPress={() => handleEmojiPress(emoji)}>
                  <Animated.Text
                    entering={ZoomIn.delay(33 * i + 100)
                      .springify()
                      .stiffness(200)
                      .damping(10)}
                    style={styles.emoji}
                  >
                    {emoji}
                  </Animated.Text>
                </Pressable>
              ))}
            </Animated.View>
          </Animated.View>
        </View>
      )}

      <Overlay />
    </View>
  );
}

const styles = StyleSheet.create({
  message: {
    maxWidth: "80%",
    marginVertical: 8,
    marginHorizontal: 16,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 24,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageTextMe: {
    color: "white",
  },
  messageTextThem: {
    color: "black",
  },
  messageMe: {
    alignSelf: "flex-end",
    backgroundColor: colors.accent,
  },
  messageThem: {
    alignSelf: "flex-start",
    backgroundColor: "white",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  emojiPopupContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 1,
  },
  emojiPopupWrapper: {
    top: -45,
    height: 50,
    backgroundColor: colors.overlay,
    borderRadius: 999,
    paddingHorizontal: 16,
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,

    elevation: 10,
  },
  emojiPopup: {
    flexDirection: "row",
    gap: 8,
  },
  emoji: {
    fontSize: 36,
    marginTop: Platform.OS === "ios" ? 2 : -1,
  },
  emojiReaction: {
    position: "absolute",
    bottom: -8,
    fontSize: 24,
    zIndex: 2,
  },
  emojiReactionMe: {
    right: 24,
  },
  emojiReactionThem: {
    left: 24,
  },
});
