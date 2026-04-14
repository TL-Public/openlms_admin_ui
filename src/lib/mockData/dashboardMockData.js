/**
 * Mock Data for Super Admin Dashboard Components
 * This file contains realistic mock data for testing dashboard components
 */

/**
 * Mock data combining both Top States datasets for insights endpoint
 * Used by: TopStatesVideoCompletions and TopStatesTraineeOnboard components
 */
export const insightsData = {
	success: true,
	data: {
		statesWithHighestCompletions: [
			{
				stateName: 'Maharashtra',
				state: 'MH',
				completionCount: 4852
			},
			{
				stateName: 'Karnataka',
				state: 'KA',
				completionCount: 3921
			},
			{
				stateName: 'Tamil Nadu',
				state: 'TN',
				completionCount: 3456
			},
			{
				stateName: 'Uttar Pradesh',
				state: 'UP',
				completionCount: 3124
			},
			{
				stateName: 'Rajasthan',
				state: 'RJ',
				completionCount: 2890
			}
		],
		statesWithMostTrainees: [
			{
				stateName: 'Uttar Pradesh',
				state: 'UP',
				traineeCount: 5234
			},
			{
				stateName: 'Maharashtra',
				state: 'MH',
				traineeCount: 4567
			},
			{
				stateName: 'Madhya Pradesh',
				state: 'MP',
				traineeCount: 3890
			},
			{
				stateName: 'Gujarat',
				state: 'GJ',
				traineeCount: 3456
			},
			{
				stateName: 'Bihar',
				state: 'BR',
				traineeCount: 3234
			}
		]
	}
};

/**
 * Mock data for Top RSETIs Trainees Onboarded
 * Used by: TopRsetisOnboarded component
 */
export const topRsetisOnboarded = {
	success: true,
	data: {
		topRsetis: [
			{
				rsetiId: 'RSETI001',
				rseti_uuid: 'uuid-rseti-001',
				state: 'MH',
				stateName: 'Maharashtra',
				traineesEnrolled: 850,
				rank: 1
			},
			{
				rsetiId: 'RSETI002',
				rseti_uuid: 'uuid-rseti-002',
				state: 'UP',
				stateName: 'Uttar Pradesh',
				traineesEnrolled: 765,
				rank: 2
			},
			{
				rsetiId: 'RSETI003',
				rseti_uuid: 'uuid-rseti-003',
				state: 'KA',
				stateName: 'Karnataka',
				traineesEnrolled: 698,
				rank: 3
			},
			{
				rsetiId: 'RSETI004',
				rseti_uuid: 'uuid-rseti-004',
				state: 'TN',
				stateName: 'Tamil Nadu',
				traineesEnrolled: 645,
				rank: 4
			},
			{
				rsetiId: 'RSETI005',
				rseti_uuid: 'uuid-rseti-005',
				state: 'GJ',
				stateName: 'Gujarat',
				traineesEnrolled: 598,
				rank: 5
			}
		]
	}
};

/**
 * Mock data for Recently Added Videos
 * Used by: RecentlyAddedVideos component
 */
export const recentlyAddedVideos = {
	success: true,
	data: {
		videos: [
			{
				videoId: 'vid-001',
				videoName: 'Introduction to Digital Marketing',
				courseCode: 'DGTL-001',
				courseName: 'Digital Marketing Fundamentals',
				thumbnail: 'https://via.placeholder.com/300x170?text=Digital+Marketing',
				description: 'Learn the basics of digital marketing including SEO, social media, and email marketing.',
				duration: 45,
				uploadedOn: '2024-04-10',
				totalViews: 245
			},
			{
				videoId: 'vid-002',
				videoName: 'Excel Advanced Formulas',
				courseCode: 'EXCEL-002',
				courseName: 'Excel for Business',
				thumbnail: 'https://via.placeholder.com/300x170?text=Excel+Formulas',
				description: 'Master advanced Excel formulas for data analysis and reporting.',
				duration: 52,
				uploadedOn: '2024-04-09',
				totalViews: 34
			},
			{
				videoId: 'vid-003',
				videoName: 'Python Basics - Variables and Data Types',
				courseCode: 'PYTHON-001',
				courseName: 'Python Programming',
				thumbnail: 'https://via.placeholder.com/300x170?text=Python+Basics',
				description: 'Understanding variables, data types, and basic operations in Python.',
				duration: 38,
				uploadedOn: '2024-04-08',
				totalViews: 41
			},
			{
				videoId: 'vid-004',
				videoName: 'Customer Service Excellence',
				courseCode: 'CUST-001',
				courseName: 'Customer Service Skills',
				thumbnail: 'https://via.placeholder.com/300x170?text=Customer+Service',
				description: 'Techniques for providing outstanding customer service in any industry.',
				duration: 41,
				uploadedOn: '2024-04-07',
				totalViews: 18
			},
			{
				videoId: 'vid-005',
				videoName: 'Web Design Principles',
				courseCode: 'WEB-001',
				courseName: 'Web Design & Development',
				thumbnail: 'https://via.placeholder.com/300x170?text=Web+Design',
				description: 'Core principles of effective web design for user engagement.',
				duration: 55,
				uploadedOn: '2024-04-06',
				totalViews: 534
			},
			{
				videoId: 'vid-006',
				videoName: 'Financial Planning Basics',
				courseCode: 'FIN-001',
				courseName: 'Personal Finance',
				thumbnail: 'https://via.placeholder.com/300x170?text=Finance',
				description: 'Create a comprehensive financial plan for your future.',
				duration: 48,
				uploadedOn: '2024-04-05',
				totalViews: 381
			}
		]
	}
};

/**
 * Mock data for View Trend
 * Used by: ViewTrend component
 */
export const viewTrend = {
	success: true,
	data: {
		trends: [
			{
				periodStart: '2024-04-01',
				periodEnd: '2024-04-07',
				totalViews: 12450
			},
			{
				periodStart: '2024-04-08',
				periodEnd: '2024-04-14',
				totalViews: 15670
			},
			{
				periodStart: '2024-04-15',
				periodEnd: '2024-04-21',
				totalViews: 18920
			},
			{
				periodStart: '2024-04-22',
				periodEnd: '2024-04-28',
				totalViews: 22340
			},
			{
				periodStart: '2024-04-29',
				periodEnd: '2024-05-05',
				totalViews: 19870
			},
			{
				periodStart: '2024-05-06',
				periodEnd: '2024-05-12',
				totalViews: 24560
			}
		]
	}
};

/**
 * Mock data for Trainee Onboard Trend
 * Used by: TraineeOnboardTrend component
 */
export const traineeOnboardTrend = {
	success: true,
	data: {
		trends: [
			{
				periodStart: '2024-04-01',
				periodEnd: '2024-04-07',
				traineesOnboarded: 234
			},
			{
				periodStart: '2024-04-08',
				periodEnd: '2024-04-14',
				traineesOnboarded: 289
			},
			{
				periodStart: '2024-04-15',
				periodEnd: '2024-04-21',
				traineesOnboarded: 267
			},
			{
				periodStart: '2024-04-22',
				periodEnd: '2024-04-28',
				traineesOnboarded: 345
			},
			{
				periodStart: '2024-04-29',
				periodEnd: '2024-05-05',
				traineesOnboarded: 312
			},
			{
				periodStart: '2024-05-06',
				periodEnd: '2024-05-12',
				traineesOnboarded: 398
			}
		]
	}
};

/**
 * Mock data for Trainee Onboard Trend Across Categories
 * Used by: TraineeOnboardTrendAcrossCategories component
 * Categories: 1=Agricultural EDPs, 2=Process EDPs, 3=Product EDPs, 4=General EDPs
 */
export const traineeOnboardTrendByCategory = {
	success: true,
	data: {
		trends: [
			// Week 1
			{ periodStart: '2024-04-01', periodEnd: '2024-04-07', categoryId: 1, traineesOnboarded: 56 },
			{ periodStart: '2024-04-01', periodEnd: '2024-04-07', categoryId: 2, traineesOnboarded: 78 },
			{ periodStart: '2024-04-01', periodEnd: '2024-04-07', categoryId: 3, traineesOnboarded: 62 },
			{ periodStart: '2024-04-01', periodEnd: '2024-04-07', categoryId: 4, traineesOnboarded: 38 },
			// Week 2
			{ periodStart: '2024-04-08', periodEnd: '2024-04-14', categoryId: 1, traineesOnboarded: 68 },
			{ periodStart: '2024-04-08', periodEnd: '2024-04-14', categoryId: 2, traineesOnboarded: 95 },
			{ periodStart: '2024-04-08', periodEnd: '2024-04-14', categoryId: 3, traineesOnboarded: 78 },
			{ periodStart: '2024-04-08', periodEnd: '2024-04-14', categoryId: 4, traineesOnboarded: 48 },
			// Week 3
			{ periodStart: '2024-04-15', periodEnd: '2024-04-21', categoryId: 1, traineesOnboarded: 52 },
			{ periodStart: '2024-04-15', periodEnd: '2024-04-21', categoryId: 2, traineesOnboarded: 89 },
			{ periodStart: '2024-04-15', periodEnd: '2024-04-21', categoryId: 3, traineesOnboarded: 71 },
			{ periodStart: '2024-04-15', periodEnd: '2024-04-21', categoryId: 4, traineesOnboarded: 55 },
			// Week 4
			{ periodStart: '2024-04-22', periodEnd: '2024-04-28', categoryId: 1, traineesOnboarded: 82 },
			{ periodStart: '2024-04-22', periodEnd: '2024-04-28', categoryId: 2, traineesOnboarded: 112 },
			{ periodStart: '2024-04-22', periodEnd: '2024-04-28', categoryId: 3, traineesOnboarded: 98 },
			{ periodStart: '2024-04-22', periodEnd: '2024-04-28', categoryId: 4, traineesOnboarded: 53 },
			// Week 5
			{ periodStart: '2024-04-29', periodEnd: '2024-05-05', categoryId: 1, traineesOnboarded: 74 },
			{ periodStart: '2024-04-29', periodEnd: '2024-05-05', categoryId: 2, traineesOnboarded: 105 },
			{ periodStart: '2024-04-29', periodEnd: '2024-05-05', categoryId: 3, traineesOnboarded: 89 },
			{ periodStart: '2024-04-29', periodEnd: '2024-05-05', categoryId: 4, traineesOnboarded: 44 },
			// Week 6
			{ periodStart: '2024-05-06', periodEnd: '2024-05-12', categoryId: 1, traineesOnboarded: 95 },
			{ periodStart: '2024-05-06', periodEnd: '2024-05-12', categoryId: 2, traineesOnboarded: 128 },
			{ periodStart: '2024-05-06', periodEnd: '2024-05-12', categoryId: 3, traineesOnboarded: 112 },
			{ periodStart: '2024-05-06', periodEnd: '2024-05-12', categoryId: 4, traineesOnboarded: 63 }
		]
	}
};

/**
 * Mock data for Traffic Insights (Hourly Video Views)
 * Used by: TrafficInsights component
 */
export const trafficInsights = {
	success: true,
	data: {
		hourlyData: [
			{ hour: 0, views: 245 },
			{ hour: 1, views: 189 },
			{ hour: 2, views: 156 },
			{ hour: 3, views: 178 },
			{ hour: 4, views: 198 },
			{ hour: 5, views: 234 },
			{ hour: 6, views: 312 },
			{ hour: 7, views: 456 },
			{ hour: 8, views: 678 },
			{ hour: 9, views: 892 },
			{ hour: 10, views: 956 },
			{ hour: 11, views: 1050 },
			{ hour: 12, views: 1200 },
			{ hour: 13, views: 1089 },
			{ hour: 14, views: 987 },
			{ hour: 15, views: 1123 },
			{ hour: 16, views: 1245 },
			{ hour: 17, views: 1468 },
			{ hour: 18, views: 1567 },
			{ hour: 19, views: 1432 },
			{ hour: 20, views: 1198 },
			{ hour: 21, views: 945 },
			{ hour: 22, views: 678 },
			{ hour: 23, views: 456 }
		]
	}
};

/**
 * Helper function to get mock data by component name
 * @param {string} componentName - The name of the component
 * @returns {object} Mock data for the component
 */
export function getMockDataByComponent(componentName) {
	const mockDataMap = {
		'InsightsData': insightsData,
		'TopStatesVideoCompletions': insightsData,
		'TopStatesTraineeOnboard': insightsData,
		'ViewTrend': viewTrend,
		'TopRsetisOnboarded': topRsetisOnboarded,
		'RecentlyAddedVideos': recentlyAddedVideos,
		'TraineeOnboardTrend': traineeOnboardTrend,
		'TraineeOnboardTrendAcrossCategories': traineeOnboardTrendByCategory,
		'TrafficInsights': trafficInsights
	};

	return mockDataMap[componentName] || null;
}

/**
 * All mock data exported as a single object
 */
export const allDashboardMockData = {
	insightsData,
	viewTrend,
	topRsetisOnboarded,
	recentlyAddedVideos,
	traineeOnboardTrend,
	traineeOnboardTrendByCategory,
	trafficInsights
};
