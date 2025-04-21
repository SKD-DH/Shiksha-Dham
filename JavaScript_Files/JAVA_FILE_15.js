"use strict";
(function () {
    var windowWithWistia = window;
    require(["jquery", "eventLogging", "util/remspect", "video/remVideo"], function ($, eventLogging, remspect, RemVideo) {
        windowWithWistia._wq = windowWithWistia._wq || [];
        windowWithWistia._wistiaVideos = windowWithWistia._wistiaVideos || [];
        windowWithWistia._wq.push({
            id: "_all", onReady: function (video) {
                var videoLoadReadyEvent = new eventLogging.LoggableEvent("videoLoad", false);
                eventLogging.queueEvent(videoLoadReadyEvent);
            }
        });
        windowWithWistia._wq.push({
            id: "_all",
            options: {
                plugin: {
                    "captions-v1": {
                        onByDefault: false,
                        language: 'eng'
                    }
                }
            }
        });
        if (remspect.isControl("removeTeacherVideoNotes")) {
            var memberDataElement = document.querySelector("#memberData");
            var accountType = memberDataElement ? memberDataElement.getAttribute("data-member-account-type") : null;
            if (accountType === "TEACHER" || accountType === "CLASSROOM_TEACHER") {
                require(["video/teacherNotes/teacher-notes-plugin"], function (TeacherNotesPlugin) {
                    windowWithWistia._wq.push({
                        id: "_all", onReady: function (video) {
                            new TeacherNotesPlugin(video);
                        }
                    });
                });
            }
        }
        var feedbackElement = document.querySelector("skills-video-feedback");
        if (feedbackElement != null) {
            var embedId_1 = feedbackElement.getAttribute("data-wistiaid");
            require(["feedback/SkillsVideoFeedbackViews"], function (SkillsVideoFeedbackViews) {
                windowWithWistia._wq.push({
                    id: embedId_1, onReady: function (video) {
                        SkillsVideoFeedbackViews.loadAndInitializePlugin(video, feedbackElement);
                    }
                });
            });
        }
        var postRollElement = document.querySelector("#todoPostRoll");
        if (postRollElement) {
            var embedId_2 = postRollElement.getAttribute("data-wistiaid");
            var todoItemId_1 = parseInt(postRollElement.getAttribute("data-todo-item-id"));
            if (isNaN(todoItemId_1)) {
                todoItemId_1 = null;
            }
            var nextTodoItemUrl_1 = postRollElement.getAttribute("data-next-todo-item-url");
            var nextTodoItemTitle_1 = postRollElement.getAttribute("data-next-todo-item-title");
            var nextTodoItemType_1 = postRollElement.getAttribute("data-next-todo-item-type");
            var nextCourseItemUrl_1 = postRollElement.getAttribute("data-next-course-item-url");
            var nextCourseItemTitle_1 = postRollElement.getAttribute("data-next-course-item-title");
            var nextCourseItemType_1 = postRollElement.getAttribute("data-next-course-item-type");
            require(["academy/lesson/video/post-roll/LessonVideoTodoPostRollViews"], function (LessonVideoTodoPostRollViews) {
                windowWithWistia._wq.push({
                    id: embedId_2, onReady: function (video) {
                        LessonVideoTodoPostRollViews.loadAndInitializePlugin(video, postRollElement, todoItemId_1, nextTodoItemTitle_1, nextTodoItemUrl_1, nextTodoItemType_1, nextCourseItemTitle_1, nextCourseItemUrl_1, nextCourseItemType_1);
                    }
                });
            });
        }
        windowWithWistia._wq.push({
            id: "_all", onReady: function (video) {
                windowWithWistia._wistiaVideos.push(video);
                var event = document.createEvent("CustomEvent");
                event.initCustomEvent("wistiaVideoReady", true, false, { video: video });
                document.dispatchEvent(event);
            }
        });
        $(document).ready(function () {
            $('.wistia_embed').each(function () {
                var embedElement = $(this);
                var wistiaId = embedElement.attr('data-wistiaid');
                var options = embedElement.data('wistiaoptions');
                var features = embedElement.data();
                if (RemVideo) {
                    new RemVideo(wistiaId, options, features, this);
                }
            });
        });
    });
})();

//# sourceMappingURL=initEmbeds.js.map