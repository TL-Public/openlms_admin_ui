import { menuItems } from '$lib/data.js';
export const BASE_URL = import.meta.env.VITE_BASE_URL;
export const QMS_URL = import.meta.env.VITE_QMS_URL;
export const HOST_URL = import.meta.env.VITE_HOST_URL;
export const ANALYTICS_URL = import.meta.env.VITE_ANALYTICS_URL;

export const roles = {
	// Super Admin
	1: {
		restrictedRoutes: [], // Admin has full access, no restrictions
		restrictedActions: {}, // No action restrictions for admin
		restrictedMenuList: []
	},

	// NAR Admin
	2: {
		restrictedRoutes: [
			// Config
			'/config',
			// '/uploadHistory'
		], // Admin has full access, no restrictions
		restrictedActions: {}, // No action restrictions for admin
		restrictedMenuList: [menuItems?.CONFIG,
			// menuItems?.UPLOAD_HISTORY
		]
	},

	// NAR Staff
	3: {
		restrictedRoutes: [
			// Config
			'/config',
			// '/uploadHistory'
		], // Admin has full access, no restrictions
		restrictedActions: {}, // No action restrictions for admin
		restrictedMenuList: [
			menuItems?.CONFIG,
			// menuItems?.UPLOAD_HISTORY
		]
	},

	// State Admin
	4: {
		restrictedRoutes: [
			// NAR
			'/nar',
			'/nar/:id/edit',

			//States
			'/states',
			'/states/add',
			'/states/:id/details/edit',
			// '/states/:id/details',

			// Courses
			'/courses/add',
			'/courses/:id/details/edit',
			'/courses/bulkUpload',
			'/courses/:id/details/chapterBulkUpload',
			'/courses/:id/details/videoBulkUpload',
			'/courses/:id/details/chapterTranslationBulkUpload',
			'/courses/courseCategories',

			//  Training Centers

			//  Training Center Courses
			'/trainingCenters/:id/details/courseAdd',
			'/trainingCenters/:id/details/courseEdit',
			'/trainingCenters/:id/details/courseBulkUpload',

			// Videos
			'/videos/bulkUpload',

			// Trainees
			'/trainees/add',
			'/trainees/:id/details/edit',
			'/trainees/bulkUpload',

			// Trainee Courses
			'/trainees/:id/details/courseAdd',
			'/trainees/:id/details/courseEdit',

			//  //  Users
			// '/users/bulkUpload', '/users/:id/details/edit' ,

			// FAQs
			'/FAQs',
			'/FAQs/:id/details',
			'/FAQs/add',
			'/FAQs/:id/details/edit',
			'/FAQs/bulkUpload',
			'/FAQs/faqCategories',

			//  Official Testimonials
			'/officialTestimonials',
			'/officialTestimonials/add',
			'/officialTestimonials/:id/details/edit',
			'/officialTestimonials/:id/details',

			//  Trainee Testimonial
			'/traineeTestimonials',
			'/traineeTestimonials/add',
			'/traineeTestimonials/:id/details',
			'/traineeTestimonials/:id/details/edit',

			// Config
			'/config',

			// Bulk Upload History
			'/uploadHistory'
		],
		restrictedActions: {
			courses: {
				add: true,
				edit: true,
				delete: true,
				list: false,
				details: false,
				addChapter: true,
				editChapter: true,
				deleteChapter: true,
				listChapter: false,
				reorderChapter: true,
				addVideo: true,
				deleteVideo: true,
				reorderVideo: true,
				moveVideo: true,
				editVideo: true,
				viewQuiz:true
			},
			trainingCenters: {
				add: false,
				edit: false,
				delete: false,
				details: false,
				list: false
			},
			trainingCenterCourses: {
				add: true,
				edit: true,
				delete: true,
				details: false,
				list: false
			},
			videos: {
				add: true,
				edit: true,
				delete: true
			},
			trainees: {
				add: true,
				edit: true,
				delete: true,
				details: false,
				list: false
			},
			traineeCourses: {
				add: true,
				edit: true,
				delete: true,
				details: false,
				list: false
			},
			users: {
				add: false,
				edit: false,
				delete: false,
				details: false,
				list: false
			},
			traineeTestimonials: {
				add: true,
				edit: true,
				delete: true,
				details: true,
				list: true
			},
			states:{
				add: true,
				edit:true,
				delete:true
			}
		},

		restrictedMenuList: [
			menuItems?.NAR,
			// menuItems.STATES,
			menuItems?.OFFICIAL_TESTIMONIALS,
			menuItems?.TRAINEE_TESTIMONIALS,
			menuItems?.FAQS,
			menuItems?.CONFIG,
			menuItems?.UPLOAD_HISTORY
		]
	},

	// State Staff
	5: {
		restrictedRoutes: [
			// NAR
			'/nar',
			'/nar/:id/edit',

			//States
			'/states',
			'/states/add',
			'/states/:id/details/edit',
			// '/states/:id/details',
			// Courses

			'/courses/add',
			'/courses/:id/details/edit',
			'/courses/bulkUpload',
			'/courses/:id/details/chapterBulkUpload',
			'/courses/:id/details/videoBulkUpload',
			'/courses/:id/details/chapterTranslationBulkUpload',
			'/courses/courseCategories',

			//  Training Centers

			//  Training Center Courses
			'/trainingCenters/:id/details/courseAdd',
			'/trainingCenters/:id/details/courseEdit',
			'/trainingCenters/:id/details/courseBulkUpload',

			// Videos
			'/videos/bulkUpload',

			// Trainees
			'/trainees/add',
			'/trainees/:id/details/edit',
			'/trainees/bulkUpload',
			// Trainee Courses
			'/trainees/:id/details/courseAdd',
			'/trainees/:id/details/courseEdit',
			//  //  Users
			// '/users/bulkUpload', '/users/add', '/users/:id/details/edit' ,
			// FAQs
			'/FAQs',
			'/FAQs/:id/details',
			'/FAQs/add',
			'/FAQs/:id/details/edit',
			'/FAQs/bulkUpload',
			'/FAQs/faqCategories',

			//  Official Testimonials
			'/officialTestimonials',
			'/officialTestimonials/add',
			'/officialTestimonials/:id/details/edit',
			'/officialTestimonials/:id/details',

			//  Trainee Testimonial
			'/traineeTestimonials',
			'/traineeTestimonials/add',
			'/traineeTestimonials/:id/details',
			'/traineeTestimonials/:id/details/edit',

			// Config
			'/config',

			// Bulk Upload History
			'/uploadHistory'
		],
		restrictedActions: {
			courses: {
				add: true,
				edit: true,
				delete: true,
				list: false,
				details: false,
				addChapter: true,
				editChapter: true,
				deleteChapter: true,
				listChapter: false,
				reorderChapter: true,
				addVideo: true,
				deleteVideo: true,
				reorderVideo: true,
				moveVideo: true,
				editVideo: true,
				viewQuiz:true
			},
			trainingCenters: {
				add: false,
				edit: false,
				delete: false,
				details: false,
				list: false
			},
			trainingCenterCourses: {
				add: true,
				edit: true,
				delete: true,
				details: false,
				list: false
			},
			videos: {
				add: true,
				edit: true,
				delete: true
			},
			trainees: {
				add: true,
				edit: true,
				delete: true,
				details: false,
				list: false
			},
			traineeCourses: {
				add: true,
				edit: true,
				delete: true,
				details: false,
				list: false
			},
			users: {
				add: false,
				edit: false,
				delete: false,
				details: false,
				list: false
			},
			traineeTestimonials: {
				add: true,
				edit: true,
				delete: true,
				details: true,
				list: true
			},
			states:{
				add: true,
				edit:true,
				delete:true
			}
		},

		restrictedMenuList: [
			menuItems?.NAR,
			// menuItems.STATES,
			menuItems?.OFFICIAL_TESTIMONIALS,
			menuItems?.TRAINEE_TESTIMONIALS,
			menuItems?.FAQS,
			menuItems?.CONFIG,
			menuItems?.UPLOAD_HISTORY
		]
	},

	// RSETI Admin
	6: {
		restrictedRoutes: [
			// NAR
			'/nar',
			'/nar/:id/edit',

			//States
			'/states',
			'/states/add',
			'/states/:id/details/edit',
			'/states/:id/details',
			// Courses
			'/courses/add',
			'/courses/:id/details/edit',
			'/courses/bulkUpload',
			'/courses/:id/details/chapterBulkUpload',
			'/courses/:id/details/videoBulkUpload',
			'/courses/:id/details/chapterTranslationBulkUpload',
			'/courses/courseCategories',

			//  Training Centers
			'/trainingCenters',
			'/trainingCenters/bulkUpload',
			'/trainingCenters/add',
			'/trainingCenters/:id/details/edit',

			// Videos
			'/videos/bulkUpload',

			// FAQs
			'/FAQs',
			'/FAQs/:id/details',
			'/FAQs/add',
			'/FAQs/:id/details/edit',
			'/FAQs/bulkUpload',
			'/FAQs/faqCategories',

			//  Official Testimonials
			'/officialTestimonials',
			'/officialTestimonials/add',
			'/officialTestimonials/:id/details/edit',
			'/officialTestimonials/:id/details',

			//  Trainee Testimonial
			'/traineeTestimonials',
			'/traineeTestimonials/add',
			'/traineeTestimonials/:id/details',
			'/traineeTestimonials/:id/details/edit',

			// Config
			'/config',

			// Bulk Upload History
			'/uploadHistory'
		],
		restrictedActions: {
			courses: {
				add: true,
				edit: true,
				delete: true,
				list: false,
				details: false,
				addChapter: true,
				editChapter: true,
				deleteChapter: true,
				listChapter: false,
				reorderChapter: true,
				addVideo: true,
				deleteVideo: true,
				reorderVideo: true,
				moveVideo: true,
				editVideo: true,
				viewQuiz:true
			},
			trainingCenters: {
				add: true,
				edit: true,
				delete: true,
				details: false,
				list: true
			},
			videos: {
				add: true,
				edit: true,
				delete: true
			},
			users: {
				add: false,
				edit: false,
				delete: false,
				details: false,
				list: false
			},
			states:{
				add: true,
				edit:true,
				delete:true
			}
		},
		restrictedMenuList: [
			menuItems?.NAR,
			menuItems.STATES,
			menuItems?.OFFICIAL_TESTIMONIALS,
			menuItems?.TRAINEE_TESTIMONIALS,
			menuItems?.FAQS,
			menuItems?.CONFIG,
			menuItems?.UPLOAD_HISTORY
		]
	},

	// RSETI Staff
	7: {
		restrictedRoutes: [
			// NAR
			'/nar',
			'/nar/:id/edit',

			//States
			'/states',
			'/states/add',
			'/states/:id/details/edit',
			'/states/:id/details',

			// Courses
			'/courses/add',
			'/courses/:id/details/edit',
			'/courses/bulkUpload',
			'/courses/:id/details/chapterBulkUpload',
			'/courses/:id/details/videoBulkUpload',
			'/courses/:id/details/chapterTranslationBulkUpload',
			'/courses/courseCategories',

			//  Training Centers
			'/trainingCenters',
			'/trainingCenters/bulkUpload',
			'/trainingCenters/add',
			'/trainingCenters/:id/details/edit',

			// Videos
			'/videos/bulkUpload',

			// FAQs
			'/FAQs',
			'/FAQs/:id/details',
			'/FAQs/add',
			'/FAQs/:id/details/edit',
			'/FAQs/bulkUpload',
			'/FAQs/faqCategories',

			//  Official Testimonials
			'/officialTestimonials',
			'/officialTestimonials/add',
			'/officialTestimonials/:id/details/edit',
			'/officialTestimonials/:id/details',

			//  Trainee Testimonial
			'/traineeTestimonials',
			'/traineeTestimonials/add',
			'/traineeTestimonials/:id/details',
			'/traineeTestimonials/:id/details/edit',

			// Config
			'/config',

			// Bulk Upload History
			'/uploadHistory'
		],
		restrictedActions: {
			courses: {
				add: true,
				edit: true,
				delete: true,
				list: false,
				details: false,
				addChapter: true,
				editChapter: true,
				deleteChapter: true,
				listChapter: false,
				reorderChapter: true,
				addVideo: true,
				deleteVideo: true,
				reorderVideo: true,
				moveVideo: true,
				editVideo: true,
				viewQuiz:true
			},
			trainingCenters: {
				add: true,
				edit: true,
				delete: true,
				details: false,
				list: true
			},
			videos: {
				add: true,
				edit: true,
				delete: true
			},
			users: {
				add: false,
				edit: false,
				delete: false,
				details: false,
				list: false
			},
			states:{
				add: true,
				edit:true,
				delete:true
			}
		},
		restrictedMenuList: [
			menuItems?.NAR,
			menuItems.STATES,
			menuItems?.OFFICIAL_TESTIMONIALS,
			menuItems?.TRAINEE_TESTIMONIALS,
			menuItems?.FAQS,
			menuItems?.CONFIG,
			menuItems?.UPLOAD_HISTORY
		]
	},

	// // Trainer
	// 8:{
	//     restrictedRoutes: [
	//         // NAR
	//         '/nar', '/nar/edit',
	//         // Courses
	// '/courses/courseCategories',
	//          '/courses/add', '/courses/:id/details/edit', '/courses/bulkUpload', '/courses/:id/details/chapterBulkUpload', '/courses/:id/details/chapterTranslationBulkUpload', '/courses/:id/details/videoBulkUpload',
	//         //  Training Centers
	//          '/trainingCenters','/trainingCenters/bulkUpload', '/trainingCenters/add','/trainingCenters/:id/details/edit',
	//           //  Training Center Courses
	//         '/trainingCenters/:id/details/courseAdd','/trainingCenters/:id/details/courseEdit','/trainingCenters/:id/details/courseBulkUpload',
	// Videos
	// '/videos/bulkUpload',
	//         // Trainees
	//         '/trainees/add','/trainees/:id/details/edit','/trainees/bulkUpload',
	//         // Trainee Courses
	//          '/trainees/:id/details/courseAdd','/trainees/:id/details/courseEdit',
	//          //  Users
	//         '/users', '/users/:id/details', '/users/bulkUpload', '/users/add', '/users/:id/details/edit' ,
	//         // FAQs
	//          '/FAQs', '/FAQs/add', '/FAQs/:id/edit','/FAQs/bulkUpload',
	//         //  Official Testimonials
	//          '/officialTestimonials', '/officialTestimonials/add', '/officialTestimonials/:id/edit', '/officialTestimonials/:id/details',
	//         //  Trainee Testimonial
	//          '/traineeTestimonials', '/traineeTestimonials/add','/traineeTestimonials/:id/details', '/traineeTestimonials/:id/details/edit',

	// Config
	// '/config',

	// Bulk Upload History
			// '/uploadHistory'
	//         ],
	//     restrictedActions: {
	//         courses: {
	//             add: true,
	//             edit: true,
	//             delete: true,
	//             list:false,
	//             details:false,
	//             addChapter:true,
	//             editChapter:true,
	//             deleteChapter:true,
	//             listChapter:false,
	//             reorderChapter:true,
	//             addVideo:true,
	//             deleteVideo:true,
	//             reorderVideo:true,
	//             moveVideo:true,
	// editVideo:true

	//         },
	//         trainingCenters:{
	//             add:true,
	//             edit:true,
	//             delete:true,
	//             details:false,
	//             list:true,
	//         },
	//         trainingCenterCourses:{
	//             add:true,
	//             edit:true,
	//             delete:true,
	//             details:false,
	//             list:false,
	//         },
	// videos:{
	// 		add: true,
	// 		edit: true,
	// 		delete: true
	// 	},
	//         trainees:{
	//             add:true,
	//             edit:true,
	//             delete:true,
	//             details:false,
	//             list:false,
	//         },
	//         traineeCourses:{
	//             add:true,
	//             edit:true,
	//             delete:true,
	//             details:true,
	//             list:true,
	//         },
	//     },
	//     restrictedMenuList:[menuItems?.NAR, menuItems?.OFFICIAL_TESTIMONIALS, menuItems?.TRAINEE_TESTIMONIALS, menuItems?.FAQS, menuItems?.USERS, menuItems?.CONFIG,
	// menuItems?.UPLOAD_HISTORY,
	// ]
	// },

	// // Trainee
	// 9:{
	//     restrictedRoutes: [
	//         // NAR
	//         '/nar', '/nar/edit',
	//         // Courses
	// '/courses/courseCategories',
	//          '/courses/add', '/courses/:id/details/edit', '/courses/bulkUpload', '/courses/:id/details/chapterBulkUpload', '/courses/:id/details/chapterTranslationBulkUpload',
	//         //  Training Centers
	//          '/trainingCenters','/trainingCenters/bulkUpload', '/trainingCenters/add','/trainingCenters/:id/details/edit',
	//           //  Training Center Courses
	//         '/trainingCenters/:id/details/courseAdd','/trainingCenters/:id/details/courseEdit','/trainingCenters/:id/details/courseBulkUpload',
	// Videos
	// '/videos/bulkUpload',
	//         // Trainees
	//        '/trainees', '/trainees/add','/trainees/:id/details/edit','/trainees/bulkUpload',
	//         // Trainee Courses
	//          '/trainees/:id/details/courseAdd','/trainees/:id/details/courseEdit',
	//          //  Users
	//         '/users', '/users/:id/details', '/users/bulkUpload', '/users/add', '/users/:id/details/edit' ,
	//         // FAQs
	//          '/FAQs', '/FAQs/add', '/FAQs/:id/edit','/FAQs/bulkUpload',
	//         //  Official Testimonials
	//          '/officialTestimonials', '/officialTestimonials/add', '/officialTestimonials/:id/edit', '/officialTestimonials/:id/details',
	//         //  Trainee Testimonial
	//          '/traineeTestimonials', '/traineeTestimonials/add','/traineeTestimonials/:id/details', '/traineeTestimonials/:id/details/edit',

	// Config
	// '/config'
	//         ],
	//     restrictedActions: {
	//         courses: {
	//             add: true,
	//             edit: true,
	//             delete: true,
	//             list:false,
	//             details:false,
	//             addChapter:true,
	//             editChapter:true,
	//             deleteChapter:true,
	//             listChapter:false,
	//             reorderChapter:true,
	//             addVideo:true,
	//             deleteVideo:true,
	//             reorderVideo:true,
	//             moveVideo:true
	// editVideo:true
	//         },
	//         trainingCenters:{
	//             add:true,
	//             edit:true,
	//             delete:true,
	//             details:false,
	//             list:true,
	//         },
	//         trainingCenterCourses:{
	//             add:true,
	//             edit:true,
	//             delete:true,
	//             details:false,
	//             list:false,
	//         },
	// videos:{
	// 		add: true,
	// 		edit: true,
	// 		delete: true
	// 	},
	//     0    trainees:{
	//             add:true,
	//             edit:true,
	//             delete:true,
	//             details:false,
	//             list:true,
	//         },
	//         traineeCourses:{
	//             add:true,
	//             edit:true,
	//             delete:true,
	//             details:false,
	//             list:false,
	//         },
	//     },
	//     restrictedMenuList:[menuItems?.NAR, menuItems?.OFFICIAL_TESTIMONIALS, menuItems?.TRAINEE_TESTIMONIALS, menuItems?.FAQS, menuItems?.USERS, menuItems?.CONFIG,
	// menuItems?.UPLOAD_HISTORY,
	// ]
	// },

		// Production Admin
	10: {
		restrictedRoutes: [
			// NAR
			'/nar',
			'/nar/:id/edit',

			//States
			'/states',
			'/states/add',
			'/states/:id/details/edit',
			'/states/:id/details',

			// Courses
			'/courses/add',
			'/courses/:id/details/edit',
			'/courses/bulkUpload',
			'/courses/courseCategories',

			//  Training Centers
			'/trainingCenters',
			'/trainingCenters/bulkUpload',
			'/trainingCenters/add',
			'/trainingCenters/:id/details/edit',

			//  Training Center Courses
			'/trainingCenters/:id/details/courseAdd',
			'/trainingCenters/:id/details/courseEdit',
			'/trainingCenters/:id/details/courseBulkUpload',


			// Trainees
			'/trainees/add',
			'/trainees/:id/details/edit',
			'/trainees/bulkUpload',

			// Trainee Courses
			'/trainees/:id/details/courseAdd',
			'/trainees/:id/details/courseEdit',

			 //  Users
			'/users/bulkUpload', '/users/:id/details/edit' ,

			// FAQs
			'/FAQs',
			'/FAQs/:id/details',
			'/FAQs/add',
			'/FAQs/:id/details/edit',
			'/FAQs/bulkUpload',
			'/FAQs/faqCategories',

			//  Official Testimonials
			'/officialTestimonials',
			'/officialTestimonials/add',
			'/officialTestimonials/:id/details/edit',
			'/officialTestimonials/:id/details',

			//  Trainee Testimonial
			'/traineeTestimonials',
			'/traineeTestimonials/add',
			'/traineeTestimonials/:id/details',
			'/traineeTestimonials/:id/details/edit',

			// Config
			'/config',

		],
		restrictedActions: {
			courses: {
				add: true,
				edit: true,
				delete: true,
				list: false,
				details: false,
				addChapter: false,
				editChapter: false,
				deleteChapter: false,
				listChapter: false,
				reorderChapter: false,
				addVideo: false,
				deleteVideo: false,
				reorderVideo: false,
				moveVideo: false,
				editVideo: false
			},
			trainingCenters: {
				add: true,
				edit: true,
				delete: true,
				details: true,
				list: true
			},
			trainingCenterCourses: {
				add: true,
				edit: true,
				delete: true,
				details: true,
				list: true
			},
			videos: {
				add: false,
				edit: false,
				delete: false
			},
			trainees: {
				add: true,
				edit: true,
				delete: true,
				details: true,
				list: true
			},
			traineeCourses: {
				add: true,
				edit: true,
				delete: true,
				details: true,
				list: true
			},
			users: {
				add: true,
				edit: true,
				delete: true,
				details: true,
				list: true
			},
			traineeTestimonials: {
				add: true,
				edit: true,
				delete: true,
				details: true,
				list: true
			},
		states:{
				add: true,
				edit:true,
				delete:true
			}
		},

		restrictedMenuList: [
			menuItems?.NAR,
			menuItems.STATES,
			menuItems?.TRAINING_CENTERS,
			menuItems?.USERS,
			menuItems?.TRAINEES,
			menuItems?.OFFICIAL_TESTIMONIALS,
			menuItems?.TRAINEE_TESTIMONIALS,
			menuItems?.FAQS,
			menuItems?.CONFIG
		]
	},
};
          