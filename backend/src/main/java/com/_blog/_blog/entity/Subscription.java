package com._blog._blog.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "subscriptions", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"subscriber_id", "subscribed_to_id"})
})
@Getter
@Setter
@NoArgsConstructor
public class Subscription {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subscriber_id", nullable = false)
    private User subscriber;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subscribed_to_id", nullable = false)
    private User subscribedTo;
    
    // Custom constructor
    public Subscription(User subscriber, User subscribedTo) {
        this.subscriber = subscriber;
        this.subscribedTo = subscribedTo;
    }
}
