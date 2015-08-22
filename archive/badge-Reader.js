 - Badge 
 
 {:id=>17, :default_name=>"Reader",
 	:badge_type_id=>3,
 	:multiple_grant=>false, 
 	:target_posts=>false, 
 	:show_posts=>false, 
 	
 	:query=>"    
 		SELECT id user_id, current_timestamp granted_at\n    
 		FROM users\n    
 		WHERE id IN\n    
 		(\n      
 		
 		SELECT pt.user_id\n      
 		FROM post_timings pt\n     
 		JOIN badge_posts b ON b.post_number = pt.post_number 
 		AND\n                            b.topic_id = pt.topic_id\n      
 		 
 		 JOIN topics t ON t.id = pt.topic_id\n      
 		 LEFT JOIN user_badges ub ON ub.badge_id = 17 AND ub.user_id = pt.user_id\n      
 		 WHERE ub.id IS NULL AND t.posts_count > 100\n      
 		 GROUP BY pt.user_id, pt.topic_id, t.posts_count\n      
 		 HAVING count(*) >= t.posts_count\n    )\n", 
 		 
 	:default_badge_grouping_id=>1, 
 	:auto_revoke=>false, 
 	:system=>true}
